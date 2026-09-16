<?php
declare(strict_types=1);

// GET /api/order-status.php?id=AO…&t=<token>
// The customer's view of one order. The token comes from the order's own
// confirmation link, so order numbers alone reveal nothing. While an online
// payment is still pending, this asks Stripe directly for the latest state.

require __DIR__ . '/_lib.php';

ao_api_bootstrap('GET');
ao_config();
ao_throttle('status', 120, 600);

$order = ao_find_order(ao_str($_GET, 'id', 40));
if (!$order || !hash_equals($order['token'], ao_str($_GET, 't', 64))) {
    ao_fail(404, 'not_found', "We couldn't find that order. Please use the link from your confirmation email, or call " . AO_PHONE . '.');
}

if ($order['payment_method'] === 'stripe' && $order['status'] === 'awaiting_payment') {
    try {
        $order = ao_stripe_reconcile($order);
    } catch (Throwable $e) {
        // Stripe unreachable for a moment: report what we know; the page asks again.
        ao_log('stripe', "Status check for {$order['id']} failed: " . $e->getMessage());
    }
}

ao_json(200, ['ok' => true, 'order' => ao_order_view($order)]);
