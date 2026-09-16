<?php
declare(strict_types=1);

// POST /api/stripe-webhook.php — Stripe's signed notifications.
// Confirms payments even when the customer closes the tab before returning to
// the site. Register it in Stripe → Developers → Webhooks with the events:
//   checkout.session.completed
//   checkout.session.async_payment_succeeded
//   checkout.session.async_payment_failed
//   checkout.session.expired

require __DIR__ . '/_lib.php';

ao_api_bootstrap('POST');
$config = ao_config();

$payload = (string) file_get_contents('php://input');
if (!ao_stripe_signature_valid($payload, (string) ($_SERVER['HTTP_STRIPE_SIGNATURE'] ?? ''), (string) $config['stripe_webhook_secret'])) {
    ao_log('webhook', 'Rejected a request with a missing or invalid signature');
    ao_fail(400, 'signature', 'Invalid signature.');
}

$event = json_decode($payload, true);
$type = is_array($event) ? (string) ($event['type'] ?? '') : '';
$session = is_array($event) ? ($event['data']['object'] ?? null) : null;
if (!is_array($session) || !str_starts_with($type, 'checkout.session.')) {
    ao_json(200, ['received' => true]);
}

$order = ao_find_order((string) ($session['client_reference_id'] ?? ''));
if (!$order) {
    ao_log('webhook', "$type for an unknown order: " . ($session['client_reference_id'] ?? '(none)'));
    ao_json(200, ['received' => true]);
}

switch ($type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
    case 'checkout.session.expired':
        ao_apply_session($order, $session);
        break;
    case 'checkout.session.async_payment_failed':
        if (($session['id'] ?? '') === $order['stripe_session_id']) {
            ao_transition($order, 'payment_failed', ['awaiting_payment']);
        }
        break;
}

// Recorded after handling, so a failure above makes Stripe retry the event.
ao_db()->prepare('INSERT OR IGNORE INTO stripe_events (id, type, received_at) VALUES (?, ?, ?)')
    ->execute([(string) ($event['id'] ?? ''), $type, date('c')]);

ao_json(200, ['received' => true]);
