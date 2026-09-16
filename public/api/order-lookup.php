<?php
declare(strict_types=1);

// POST /api/order-lookup.php — "Track an order" on the Support page.
// Body: { orderId, contact } — contact is the email or mobile number the order
// was placed with. Only when both match does this hand back the order's private
// link token, so an order number on its own still reveals nothing.

require __DIR__ . '/_lib.php';

ao_api_bootstrap('POST');
ao_config();
$in = ao_json_body();
ao_throttle('lookup', 10, 900);

$id = ao_normalise_order_id(ao_str($in, 'orderId', 40));
$contact = ao_str($in, 'contact', 120);
$byEmail = str_contains($contact, '@');
$phone = $byEmail ? '' : ao_indian_mobile($contact);

$errors = [];
if ($id === '') {
    $errors['orderId'] = 'Enter your order number. It starts with AO, like AO260916-7KQ2M.';
}
if ($byEmail ? !ao_valid_email($contact) : !preg_match('/^\d{10}$/', $phone)) {
    $errors['contact'] = 'Enter the email or 10-digit mobile number you ordered with.';
}
if ($errors) {
    ao_fail(422, 'validation', 'Please check the highlighted details.', $errors);
}

$order = ao_find_order($id);
$matches = $order !== null && ($byEmail
    ? hash_equals(strtolower($order['customer_email']), strtolower($contact))
    : hash_equals($order['customer_phone'], $phone));

if (!$matches) {
    // The same answer whether the number or the contact detail was wrong.
    ao_fail(404, 'not_found', "We couldn't find an order with those details. Check the order number in your confirmation email, and use the email or mobile number you ordered with.");
}

ao_json(200, ['ok' => true, 'orderId' => $order['id'], 'token' => $order['token']]);
