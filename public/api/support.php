<?php
declare(strict_types=1);

// POST /api/support.php — the message form on the Support page. Saved for the
// admin page and emailed to the store, with Reply-To set to the customer.

require __DIR__ . '/_lib.php';

// Keep in step with TOPICS in src/pages/Support.tsx.
const AO_SUPPORT_TOPICS = ['Order & delivery', 'Payment or refund', 'Damaged or wrong item', 'Product question', 'Something else'];

ao_api_bootstrap('POST');
$config = ao_config();
$in = ao_json_body();

// The hidden "website" field is invisible to people; a value means a bot.
// Answer as if it worked, so it learns nothing.
if (ao_str($in, 'website') !== '') {
    ao_json(200, ['ok' => true]);
}

ao_throttle('support', 5, 600);

$typedOrder = ao_str($in, 'orderId', 30);
$s = [
    'name' => ao_str($in, 'name', 80),
    'email' => ao_str($in, 'email', 120),
    'phone' => ao_str($in, 'phone', 20),
    // Kept as typed when it isn't a well-formed number, so nothing is lost.
    'order_id' => ao_normalise_order_id($typedOrder) ?: $typedOrder,
    'topic' => ao_str($in, 'topic', 40),
    'message' => ao_text($in, 'message', 2000),
];

$errors = [];
if (ao_len($s['name']) < 2) {
    $errors['name'] = 'Enter your name.';
}
if (!ao_valid_email($s['email'])) {
    $errors['email'] = 'Enter a valid email address.';
}
if (strlen(preg_replace('/\D/', '', $s['phone']) ?? '') < 10) {
    $errors['phone'] = 'Enter a phone number we can call.';
}
if (ao_len($s['message']) < 10) {
    $errors['message'] = 'Tell us a little more, so we can help.';
}
if (!in_array($s['topic'], AO_SUPPORT_TOPICS, true)) {
    $s['topic'] = 'Something else';
}
if ($errors) {
    ao_fail(422, 'validation', 'Please check the highlighted details.', $errors);
}

ao_db()->prepare('INSERT INTO support_requests (created_at, name, email, phone, order_id, topic, message) VALUES (?, ?, ?, ?, ?, ?, ?)')
    ->execute([date('c'), $s['name'], $s['email'], $s['phone'], $s['order_id'], $s['topic'], $s['message']]);

$orderLine = '';
if ($s['order_id'] !== '') {
    $order = ao_find_order($s['order_id']);
    $orderLine = "Order: {$s['order_id']}"
        . ($order
            ? ' · ' . (strcasecmp($order['customer_email'], $s['email']) === 0 ? 'same email as the order' : 'a different email from the order')
                . "\nOpen in admin: " . $config['site_url'] . '/api/admin.php?order=' . rawurlencode($order['id'])
            : ' · no order has this number')
        . "\n";
}

ao_mail(
    (string) $config['owner_email'],
    "Support · {$s['topic']} · {$s['name']}" . ($s['order_id'] !== '' ? " · {$s['order_id']}" : ''),
    "Support message from the website\n\n"
        . "Topic: {$s['topic']}\nName: {$s['name']}\nEmail: {$s['email']}\nPhone: {$s['phone']}\n$orderLine\n"
        . "{$s['message']}\n\n"
        . "Reply to this email to answer {$s['name']}.\n",
    $s['email'],
);

ao_json(200, ['ok' => true]);
