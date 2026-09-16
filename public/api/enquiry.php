<?php
declare(strict_types=1);

// POST /api/enquiry.php — the Bulk Orders form. Saved, and emailed to the store.

require __DIR__ . '/_lib.php';

const AO_ENQUIRY_TYPES = ['Bulk Purchase', 'Retail Partnership', 'Corporate Gifting', 'Supplier / Vendor', 'Private Label'];

ao_api_bootstrap('POST');
$config = ao_config();
$in = ao_json_body();

// The hidden "website" field is invisible to people; a value means a bot.
// Answer as if it worked, so it learns nothing.
if (ao_str($in, 'website') !== '') {
    ao_json(200, ['ok' => true]);
}

ao_throttle('enquiry', 5, 600);

$e = [
    'name' => ao_str($in, 'name', 80),
    'business' => ao_str($in, 'business', 120),
    'email' => ao_str($in, 'email', 120),
    'phone' => ao_str($in, 'phone', 20),
    'type' => ao_str($in, 'type', 40),
    'message' => ao_text($in, 'message', 2000),
];

$errors = [];
if (ao_len($e['name']) < 2) {
    $errors['name'] = 'Enter your name.';
}
if (ao_len($e['business']) < 2) {
    $errors['business'] = 'Enter your business or organisation.';
}
if (!ao_valid_email($e['email'])) {
    $errors['email'] = 'Enter a valid email address.';
}
if (strlen(preg_replace('/\D/', '', $e['phone']) ?? '') < 10) {
    $errors['phone'] = 'Enter a phone number we can call.';
}
if (!in_array($e['type'], AO_ENQUIRY_TYPES, true)) {
    $e['type'] = AO_ENQUIRY_TYPES[0];
}
if ($errors) {
    ao_fail(422, 'validation', 'Please check your details: ' . implode(' ', $errors), $errors);
}

ao_db()->prepare('INSERT INTO enquiries (created_at, name, business, email, phone, type, message) VALUES (?, ?, ?, ?, ?, ?, ?)')
    ->execute([date('c'), $e['name'], $e['business'], $e['email'], $e['phone'], $e['type'], $e['message']]);

ao_mail(
    (string) $config['owner_email'],
    "New enquiry · {$e['type']} · {$e['business']}",
    "{$e['type']} enquiry from the website\n\n"
        . "Name: {$e['name']}\nBusiness: {$e['business']}\nEmail: {$e['email']}\nPhone: {$e['phone']}\n\n"
        . ($e['message'] !== '' ? $e['message'] : '(no message)') . "\n",
    $e['email'],
);

ao_json(200, ['ok' => true]);
