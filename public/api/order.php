<?php
declare(strict_types=1);

// POST /api/order.php — places an order.
// Body: { items: [{sku, qty}], customer: {name, phone, email},
//         address: {line1, line2, city, state, pincode}, notes, payment: "stripe" | "cod" }
// Cash on Delivery orders are confirmed at once. Online orders get a Stripe
// Checkout page to pay on; the order is marked paid only once Stripe confirms.

require __DIR__ . '/_lib.php';

ao_api_bootstrap('POST');
ao_config();
$in = ao_json_body();
ao_throttle('order', 20, 600);

$priced = ao_price_items($in['items'] ?? null);
$details = ao_validate_order_details($in);

$payment = ao_str($in, 'payment', 10);
$codEnabled = !empty(ao_catalog()['cod']['enabled']);
if (!in_array($payment, $codEnabled ? ['stripe', 'cod'] : ['stripe'], true)) {
    ao_fail(422, 'validation', 'Please choose how you would like to pay.', ['payment' => 'Choose a payment method.']);
}

$order = ao_create_order($details, $priced, $payment);

if ($payment === 'cod') {
    ao_notify_order($order);
    ao_json(200, ['ok' => true, 'orderId' => $order['id'], 'token' => $order['token'], 'next' => 'confirmation']);
}

try {
    $session = ao_stripe_create_session($order, $priced);
} catch (Throwable $e) {
    ao_log('stripe', "Could not start payment for {$order['id']}: " . $e->getMessage());
    ao_transition($order, 'payment_failed', ['awaiting_payment']);
    $message = $codEnabled
        ? "We couldn't start the online payment. Please try again in a moment, or choose Cash on Delivery."
        : "We couldn't start the online payment. Please try again in a moment.";
    ao_fail(502, 'payment_unavailable', $message);
}

ao_db()->prepare('UPDATE orders SET stripe_session_id = ?, updated_at = ? WHERE id = ?')
    ->execute([$session['id'], date('c'), $order['id']]);

ao_json(200, [
    'ok' => true,
    'orderId' => $order['id'],
    'token' => $order['token'],
    'next' => 'redirect',
    'url' => $session['url'],
]);
