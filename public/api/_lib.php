<?php
declare(strict_types=1);

// Abhimanyu Organics — order API, shared by the endpoints in this folder.
//
// Secrets and data never live in public_html. They sit in a folder named
// "private" beside it (…/domains/<site>/private): config.php (see
// server/config.example.php in the repository) and store.sqlite, the order
// database, which is created on first use. AO_PRIVATE_DIR overrides the
// location for local testing.
//
// Requires PHP 8.1+ with pdo_sqlite, curl, openssl and mbstring — all on by
// default on Hostinger.

ini_set('display_errors', '0');
date_default_timezone_set('Asia/Kolkata');

const AO_STATES = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
    'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
    'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal',
];

const AO_MAX_QTY = 20;
const AO_MAX_LINES = 30;
const AO_PHONE = '+91 90502 62600';

/* ------------------------------------------------------------ responses --- */

function ao_json(int $status, array $body): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function ao_fail(int $status, string $error, string $message, array $fields = []): never
{
    $body = ['ok' => false, 'error' => $error, 'message' => $message];
    if ($fields) {
        $body['fields'] = $fields;
    }
    ao_json($status, $body);
}

/** Endpoints call this first, so an unexpected error still answers in JSON. */
function ao_api_bootstrap(string $method): void
{
    set_exception_handler(function (Throwable $e): void {
        ao_log('error', $e::class . ': ' . $e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine());
        ao_fail(500, 'server', 'Something went wrong on our side. Please try again, or call ' . AO_PHONE . '.');
    });
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        header('Allow: ' . $method);
        ao_fail(405, 'method', 'Method not allowed.');
    }
}

function ao_log(string $channel, string $message): void
{
    $line = date('c') . " [$channel] " . str_replace(["\r", "\n"], ' ', $message) . "\n";
    @file_put_contents(ao_private_dir() . '/store.log', $line, FILE_APPEND | LOCK_EX);
}

/* ---------------------------------------------------------------- input --- */

function ao_json_body(): array
{
    $raw = file_get_contents('php://input', false, null, 0, 64 * 1024);
    $data = json_decode($raw === false ? '' : $raw, true);
    if (!is_array($data)) {
        ao_fail(400, 'bad_request', 'The request could not be read.');
    }
    return $data;
}

function ao_cut(string $value, int $max): string
{
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

function ao_len(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
}

/** A single-line string: control characters removed, whitespace collapsed. */
function ao_str(array $source, string $key, int $max = 200): string
{
    $value = $source[$key] ?? '';
    if (!is_string($value)) {
        return '';
    }
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '';
    $value = trim(preg_replace('/\s+/u', ' ', $value) ?? '');
    return ao_cut($value, $max);
}

/** Multi-line text: like ao_str() but keeps line breaks. */
function ao_text(array $source, string $key, int $max = 2000): string
{
    $value = $source[$key] ?? '';
    if (!is_string($value)) {
        return '';
    }
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    $value = preg_replace('/[\x00-\x09\x0B-\x1F\x7F]+/u', ' ', $value) ?? '';
    $value = preg_replace("/\n{3,}/", "\n\n", $value) ?? '';
    return ao_cut(trim($value), $max);
}

function ao_valid_email(string $email): bool
{
    return strlen($email) <= 120 && filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function ao_indian_mobile(string $raw): string
{
    $digits = preg_replace('/\D/', '', $raw) ?? '';
    if (strlen($digits) > 10) {
        $digits = preg_replace('/^(91|0)/', '', $digits) ?? '';
    }
    return $digits;
}

function ao_client_ip(): string
{
    return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

/* --------------------------------------------------------------- config --- */

function ao_private_dir(): string
{
    $override = getenv('AO_PRIVATE_DIR');
    if (is_string($override) && $override !== '') {
        return rtrim($override, '/\\');
    }
    return dirname(__DIR__, 2) . '/private';
}

/**
 * Why the private folder must not be used, or null if it is safe. It holds the
 * order database, so it must never sit inside the folder the web server serves
 * — as it would if this site lived in a sub-folder of another site's
 * public_html, making "one level up" still public.
 */
function ao_private_dir_problem(): ?string
{
    $webRoot = realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''));
    $private = realpath(ao_private_dir());
    if (!$webRoot || !$private) {
        return null;
    }
    $normalise = fn (string $path) => rtrim(str_replace('\\', '/', $path), '/') . '/';
    if (str_starts_with($normalise($private), $normalise($webRoot))) {
        return 'The private folder is inside the public website folder, where its files could be downloaded. Move it next to public_html instead.';
    }
    return null;
}

function ao_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }
    if (ao_private_dir_problem() !== null) {
        // Deliberately not logged: the log would be written into that same
        // publicly reachable folder.
        ao_fail(503, 'setup', 'Online ordering is not open yet. Please call ' . AO_PHONE . ' to order.');
    }
    $file = ao_private_dir() . '/config.php';
    $loaded = is_file($file) ? require $file : null;
    if (!is_array($loaded)) {
        ao_fail(503, 'setup', 'Online ordering is not open yet. Please call ' . AO_PHONE . ' to order.');
    }
    $config = $loaded + [
        'site_url' => '',
        'stripe_secret_key' => '',
        'stripe_webhook_secret' => '',
        'stripe_api_base' => 'https://api.stripe.com',
        'owner_email' => '',
        'mail_transport' => 'mail',
        'mail_from' => '',
        'mail_from_name' => 'Abhimanyu Organics',
        'smtp' => [],
        'admin_password' => '',
    ];
    $config['site_url'] = rtrim((string) $config['site_url'], '/');
    return $config;
}

/** A setting still holding its placeholder from config.example.php. */
function ao_unset(mixed $value): bool
{
    return !is_string($value) || $value === '' || str_contains($value, 'REPLACE');
}

/* ------------------------------------------------------------- database --- */

function ao_db(): PDO
{
    static $db = null;
    if ($db instanceof PDO) {
        return $db;
    }
    if (!extension_loaded('pdo_sqlite')) {
        ao_log('setup', 'pdo_sqlite is not enabled');
        ao_fail(503, 'setup', 'Online ordering is temporarily unavailable. Please call ' . AO_PHONE . '.');
    }
    $dir = ao_private_dir();
    if (!is_dir($dir) || !is_writable($dir) || ao_private_dir_problem() !== null) {
        ao_fail(503, 'setup', 'Online ordering is not open yet. Please call ' . AO_PHONE . ' to order.');
    }
    $db = new PDO('sqlite:' . $dir . '/store.sqlite', null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $db->exec('PRAGMA busy_timeout = 5000');
    $db->exec(<<<'SQL'
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            token TEXT NOT NULL,
            status TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            address_line1 TEXT NOT NULL,
            address_line2 TEXT NOT NULL DEFAULT '',
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            pincode TEXT NOT NULL,
            notes TEXT NOT NULL DEFAULT '',
            items TEXT NOT NULL,
            subtotal INTEGER NOT NULL,
            shipping INTEGER NOT NULL,
            total INTEGER NOT NULL,
            stripe_session_id TEXT,
            stripe_payment_intent TEXT,
            paid_at TEXT,
            emailed_at TEXT
        );
        CREATE INDEX IF NOT EXISTS orders_by_created ON orders (created_at);
        CREATE INDEX IF NOT EXISTS orders_by_session ON orders (stripe_session_id);
        CREATE TABLE IF NOT EXISTS enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            name TEXT NOT NULL,
            business TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            type TEXT NOT NULL,
            message TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS support_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            order_id TEXT NOT NULL DEFAULT '',
            topic TEXT NOT NULL,
            message TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS support_by_order ON support_requests (order_id);
        CREATE TABLE IF NOT EXISTS stripe_events (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            received_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS hits (
            bucket TEXT NOT NULL,
            who TEXT NOT NULL,
            at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS hits_by_bucket ON hits (bucket, who, at);
        SQL);
    return $db;
}

/** Allows at most $max requests per client per $seconds for one bucket. */
function ao_throttle(string $bucket, int $max, int $seconds): void
{
    $db = ao_db();
    $now = time();
    $who = hash('sha256', ao_client_ip());
    $db->prepare('DELETE FROM hits WHERE at < ?')->execute([$now - 86400]);
    $count = $db->prepare('SELECT COUNT(*) FROM hits WHERE bucket = ? AND who = ? AND at > ?');
    $count->execute([$bucket, $who, $now - $seconds]);
    if ((int) $count->fetchColumn() >= $max) {
        ao_fail(429, 'rate_limited', 'Too many attempts. Please wait a few minutes and try again.');
    }
    $db->prepare('INSERT INTO hits (bucket, who, at) VALUES (?, ?, ?)')->execute([$bucket, $who, $now]);
}

/* ------------------------------------------------------------- catalogue --- */

function ao_catalog(): array
{
    static $catalog = null;
    if ($catalog !== null) {
        return $catalog;
    }
    $raw = @file_get_contents(__DIR__ . '/catalog.json');
    $data = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($data) || !isset($data['products'], $data['shipping'])) {
        throw new RuntimeException('catalog.json is missing or unreadable');
    }
    return $catalog = $data;
}

/**
 * Prices a cart from the catalogue. The browser only says which packs and how
 * many; every amount is decided here.
 */
function ao_price_items(mixed $items): array
{
    if (!is_array($items) || !$items) {
        ao_fail(422, 'empty_cart', 'Your cart is empty.');
    }
    if (count($items) > AO_MAX_LINES) {
        ao_fail(422, 'cart_too_large', 'That is a large order. Please call ' . AO_PHONE . ' and we will arrange it.');
    }

    $packs = [];
    foreach (ao_catalog()['products'] as $product) {
        foreach ($product['packs'] ?? [] as $pack) {
            $packs[$product['id'] . ':' . $pack['id']] = [$product, $pack];
        }
    }

    $lines = [];
    foreach ($items as $item) {
        $sku = is_array($item) && is_string($item['sku'] ?? null) ? $item['sku'] : '';
        $qty = is_array($item) && is_int($item['qty'] ?? null) ? $item['qty'] : 0;
        if (!isset($packs[$sku])) {
            ao_fail(422, 'unavailable_item', 'Something in your cart is no longer available. Please review your cart and try again.');
        }
        if ($qty < 1 || $qty > AO_MAX_QTY) {
            ao_fail(422, 'bad_quantity', 'Please choose between 1 and ' . AO_MAX_QTY . ' of each item.');
        }
        [$product, $pack] = $packs[$sku];
        if (isset($lines[$sku])) {
            $lines[$sku]['qty'] = min(AO_MAX_QTY, $lines[$sku]['qty'] + $qty);
            continue;
        }
        $lines[$sku] = [
            'sku' => $sku,
            'name' => (string) $product['name'],
            'pack' => (string) $pack['label'],
            'unitPrice' => (int) $pack['price'],
            'qty' => $qty,
        ];
    }

    $subtotal = 0;
    foreach ($lines as &$line) {
        $line['lineTotal'] = $line['unitPrice'] * $line['qty'];
        $subtotal += $line['lineTotal'];
    }
    unset($line);

    $rules = ao_catalog()['shipping'];
    $shipping = $subtotal >= (int) $rules['freeFrom'] ? 0 : (int) $rules['fee'];

    return ['items' => array_values($lines), 'subtotal' => $subtotal, 'shipping' => $shipping, 'total' => $subtotal + $shipping];
}

/* --------------------------------------------------------------- orders --- */

function ao_validate_order_details(array $in): array
{
    $customer = is_array($in['customer'] ?? null) ? $in['customer'] : [];
    $address = is_array($in['address'] ?? null) ? $in['address'] : [];
    $d = [
        'name' => ao_str($customer, 'name', 80),
        'phone' => ao_indian_mobile(ao_str($customer, 'phone', 20)),
        'email' => ao_str($customer, 'email', 120),
        'line1' => ao_str($address, 'line1', 120),
        'line2' => ao_str($address, 'line2', 120),
        'city' => ao_str($address, 'city', 60),
        'state' => ao_str($address, 'state', 60),
        'pincode' => ao_str($address, 'pincode', 10),
        'notes' => ao_text($in, 'notes', 300),
    ];

    $errors = [];
    if (ao_len($d['name']) < 2) {
        $errors['name'] = 'Enter your full name.';
    }
    if (!preg_match('/^[6-9]\d{9}$/', $d['phone'])) {
        $errors['phone'] = 'Enter a 10-digit Indian mobile number.';
    }
    if (!ao_valid_email($d['email'])) {
        $errors['email'] = 'Enter a valid email address.';
    }
    if (ao_len($d['line1']) < 5) {
        $errors['line1'] = 'Enter your house number and street.';
    }
    if (ao_len($d['city']) < 2) {
        $errors['city'] = 'Enter your city or town.';
    }
    if (!in_array($d['state'], AO_STATES, true)) {
        $errors['state'] = 'Choose your state.';
    }
    if (!preg_match('/^[1-9]\d{5}$/', $d['pincode'])) {
        $errors['pincode'] = 'Enter a 6-digit PIN code.';
    }
    if ($errors) {
        ao_fail(422, 'validation', 'Please check the highlighted details.', $errors);
    }
    return $d;
}

/** Short, readable on the phone, and without look-alike characters. */
function ao_new_order_id(PDO $db): string
{
    $alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    $exists = $db->prepare('SELECT 1 FROM orders WHERE id = ?');
    for ($attempt = 0; $attempt < 8; $attempt++) {
        $suffix = '';
        for ($i = 0; $i < 5; $i++) {
            $suffix .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }
        $id = 'AO' . date('ymd') . '-' . $suffix;
        $exists->execute([$id]);
        if (!$exists->fetchColumn()) {
            return $id;
        }
    }
    throw new RuntimeException('Could not allocate an order number');
}

function ao_create_order(array $details, array $priced, string $payment): array
{
    $db = ao_db();
    $now = date('c');
    $order = [
        'id' => ao_new_order_id($db),
        'token' => bin2hex(random_bytes(16)),
        'status' => $payment === 'cod' ? 'cod_confirmed' : 'awaiting_payment',
        'payment_method' => $payment,
        'created_at' => $now,
        'updated_at' => $now,
        'customer_name' => $details['name'],
        'customer_email' => $details['email'],
        'customer_phone' => $details['phone'],
        'address_line1' => $details['line1'],
        'address_line2' => $details['line2'],
        'city' => $details['city'],
        'state' => $details['state'],
        'pincode' => $details['pincode'],
        'notes' => $details['notes'],
        'items' => json_encode($priced['items'], JSON_UNESCAPED_UNICODE),
        'subtotal' => $priced['subtotal'],
        'shipping' => $priced['shipping'],
        'total' => $priced['total'],
    ];
    $columns = array_keys($order);
    $db->prepare('INSERT INTO orders (' . implode(', ', $columns) . ') VALUES (' . implode(', ', array_fill(0, count($columns), '?')) . ')')
        ->execute(array_values($order));
    return ao_find_order($order['id']);
}

/**
 * An order number the way people type it back — any case, with spaces, a "#"
 * or no hyphen — in its stored form, or '' if it can't be one.
 */
function ao_normalise_order_id(string $raw): string
{
    $compact = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $raw) ?? '');
    return preg_match('/^(AO\d{6})([A-Z0-9]{5})$/', $compact, $m) ? "{$m[1]}-{$m[2]}" : '';
}

function ao_find_order(string $id): ?array
{
    if ($id === '') {
        return null;
    }
    $stmt = ao_db()->prepare('SELECT * FROM orders WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

/**
 * Moves an order to $status only from one of the $from states, so a late or
 * repeated signal can never undo a later step (e.g. "expired" after "paid").
 */
function ao_transition(array $order, string $status, array $from, array $extra = []): array
{
    $set = ['status' => $status, 'updated_at' => date('c')] + $extra;
    $assignments = implode(', ', array_map(fn ($column) => "$column = ?", array_keys($set)));
    $placeholders = implode(', ', array_fill(0, count($from), '?'));
    $stmt = ao_db()->prepare("UPDATE orders SET $assignments WHERE id = ? AND status IN ($placeholders)");
    $stmt->execute([...array_values($set), $order['id'], ...$from]);
    return ao_find_order($order['id']) ?? $order;
}

function ao_order_view(array $o): array
{
    return [
        'id' => $o['id'],
        'status' => $o['status'],
        'paymentMethod' => $o['payment_method'],
        'createdAt' => $o['created_at'],
        'customer' => ['name' => $o['customer_name'], 'email' => $o['customer_email'], 'phone' => $o['customer_phone']],
        'address' => [
            'line1' => $o['address_line1'],
            'line2' => $o['address_line2'],
            'city' => $o['city'],
            'state' => $o['state'],
            'pincode' => $o['pincode'],
        ],
        'items' => json_decode($o['items'], true) ?: [],
        'subtotal' => (int) $o['subtotal'],
        'shipping' => (int) $o['shipping'],
        'total' => (int) $o['total'],
    ];
}

function ao_order_link(array $order): string
{
    return ao_config()['site_url'] . '/order/' . rawurlencode($order['id']) . '?t=' . $order['token'];
}

/* --------------------------------------------------------------- stripe --- */

function ao_stripe(string $method, string $path, array $params = [], array $headers = []): array
{
    $config = ao_config();
    if (ao_unset($config['stripe_secret_key'])) {
        throw new RuntimeException('Stripe secret key is not set in config.php');
    }
    if (!function_exists('curl_init')) {
        throw new RuntimeException('The PHP curl extension is not enabled');
    }

    $url = rtrim((string) $config['stripe_api_base'], '/') . $path;
    $curl = curl_init();
    $options = [
        CURLOPT_URL => $method === 'GET' && $params ? $url . '?' . http_build_query($params) : $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 25,
        CURLOPT_USERPWD => $config['stripe_secret_key'] . ':',
        CURLOPT_HTTPHEADER => array_merge(['Content-Type: application/x-www-form-urlencoded'], $headers),
    ];
    if ($method === 'POST') {
        $options[CURLOPT_POST] = true;
        $options[CURLOPT_POSTFIELDS] = http_build_query($params);
    }
    curl_setopt_array($curl, $options);
    $body = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $curlError = curl_error($curl);

    if ($body === false) {
        throw new RuntimeException('Stripe request failed: ' . $curlError);
    }
    $data = json_decode((string) $body, true);
    if (!is_array($data)) {
        throw new RuntimeException("Stripe returned an unreadable response (HTTP $status)");
    }
    if ($status >= 400) {
        throw new RuntimeException('Stripe: ' . ($data['error']['message'] ?? "HTTP $status"));
    }
    return $data;
}

/** Drops empty values: Stripe reads an empty string as "unset" and refuses it for some fields. */
function ao_compact(array $values): array
{
    return array_filter($values, fn ($value) => $value !== '' && $value !== null);
}

function ao_stripe_create_session(array $order, array $priced): array
{
    $site = ao_config()['site_url'];
    $lineItems = array_map(fn (array $line) => [
        'quantity' => $line['qty'],
        'price_data' => [
            'currency' => 'inr',
            'unit_amount' => $line['unitPrice'] * 100,
            'product_data' => ['name' => $line['name'] . ' — ' . $line['pack']],
        ],
    ], $priced['items']);

    $params = [
        'mode' => 'payment',
        'client_reference_id' => $order['id'],
        'customer_email' => $order['customer_email'],
        'line_items' => $lineItems,
        'success_url' => $site . '/order/' . rawurlencode($order['id']) . '?t=' . $order['token'] . '&session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => $site . '/checkout?cancelled=1',
        'expires_at' => time() + 3600,
        'metadata' => ['order_id' => $order['id']],
        'payment_intent_data' => [
            'description' => 'Abhimanyu Organics order ' . $order['id'],
            'metadata' => ['order_id' => $order['id']],
            'shipping' => [
                'name' => $order['customer_name'],
                'phone' => '+91' . $order['customer_phone'],
                'address' => ao_compact([
                    'line1' => $order['address_line1'],
                    'line2' => $order['address_line2'],
                    'city' => $order['city'],
                    'state' => $order['state'],
                    'postal_code' => $order['pincode'],
                    'country' => 'IN',
                ]),
            ],
        ],
    ];
    if ($priced['shipping'] > 0) {
        $params['shipping_options'] = [[
            'shipping_rate_data' => [
                'type' => 'fixed_amount',
                'display_name' => 'Delivery',
                'fixed_amount' => ['amount' => $priced['shipping'] * 100, 'currency' => 'inr'],
            ],
        ]];
    }

    // The order number doubles as the idempotency key: a retried request can
    // never create a second payment session for the same order.
    return ao_stripe('POST', '/v1/checkout/sessions', $params, ['Idempotency-Key: checkout-' . $order['id']]);
}

/**
 * Applies what Stripe says about a Checkout Session to its order. Used both by
 * the confirmation page (asking Stripe directly) and by the webhook.
 */
function ao_apply_session(array $order, array $session): array
{
    if (($session['id'] ?? '') !== $order['stripe_session_id'] || ($session['client_reference_id'] ?? '') !== $order['id']) {
        ao_log('stripe', "Session does not match order {$order['id']}");
        return $order;
    }

    if (($session['payment_status'] ?? '') === 'paid') {
        if ((int) ($session['amount_total'] ?? -1) !== (int) $order['total'] * 100) {
            ao_log('stripe', "Amount mismatch on {$order['id']}: Stripe {$session['amount_total']}, order {$order['total']}00");
            return $order;
        }
        $paid = ao_transition($order, 'paid', ['awaiting_payment', 'payment_failed'], [
            'stripe_payment_intent' => is_string($session['payment_intent'] ?? null) ? $session['payment_intent'] : '',
            'paid_at' => date('c'),
        ]);
        if ($paid['status'] === 'paid') {
            ao_notify_order($paid);
        }
        return $paid;
    }

    if (($session['status'] ?? '') === 'expired') {
        return ao_transition($order, 'expired', ['awaiting_payment']);
    }
    return $order;
}

function ao_stripe_reconcile(array $order): array
{
    if (!$order['stripe_session_id']) {
        return $order;
    }
    $session = ao_stripe('GET', '/v1/checkout/sessions/' . rawurlencode($order['stripe_session_id']));
    return ao_apply_session($order, $session);
}

function ao_stripe_signature_valid(string $payload, string $header, string $secret, int $tolerance = 300): bool
{
    if ($header === '' || ao_unset($secret)) {
        return false;
    }
    $timestamp = null;
    $signatures = [];
    foreach (explode(',', $header) as $part) {
        [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');
        if ($key === 't' && ctype_digit($value)) {
            $timestamp = (int) $value;
        } elseif ($key === 'v1') {
            $signatures[] = $value;
        }
    }
    if ($timestamp === null || !$signatures || abs(time() - $timestamp) > $tolerance) {
        return false;
    }
    $expected = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);
    foreach ($signatures as $signature) {
        if (hash_equals($expected, $signature)) {
            return true;
        }
    }
    return false;
}

/* ---------------------------------------------------------------- email --- */

function ao_rupees(int $amount): string
{
    return '₹' . number_format($amount);
}

function ao_mime_header(string $text): string
{
    return preg_match('/[^\x20-\x7E]/', $text) ? '=?UTF-8?B?' . base64_encode($text) . '?=' : $text;
}

/** Sends a plain-text email. Failures are logged, never shown to customers. */
function ao_mail(string $to, string $subject, string $body, string $replyTo = ''): bool
{
    $config = ao_config();
    $from = (string) $config['mail_from'];
    if (!ao_valid_email($to) || !ao_valid_email($from)) {
        ao_log('mail', "Not sent (missing or invalid address): $subject");
        return false;
    }

    $headers = [
        'Date' => date(DATE_RFC2822),
        'From' => ao_mime_header((string) $config['mail_from_name']) . " <$from>",
        'To' => $to,
        'Subject' => ao_mime_header($subject),
        'Message-ID' => '<' . bin2hex(random_bytes(12)) . '@' . substr(strrchr($from, '@') ?: '@localhost', 1) . '>',
        'MIME-Version' => '1.0',
        'Content-Type' => 'text/plain; charset=UTF-8',
        'Content-Transfer-Encoding' => 'base64',
    ];
    if ($replyTo !== '' && ao_valid_email($replyTo)) {
        $headers['Reply-To'] = $replyTo;
    }
    $encoded = chunk_split(base64_encode($body));

    try {
        switch ($config['mail_transport']) {
            case 'log':
                $entry = "=== " . date('c') . " ===\nTo: $to\nSubject: $subject\n" . ($replyTo ? "Reply-To: $replyTo\n" : '') . "\n$body\n\n";
                file_put_contents(ao_private_dir() . '/outbox.log', $entry, FILE_APPEND | LOCK_EX);
                return true;
            case 'smtp':
                ao_smtp_send((array) $config['smtp'], $from, $to, $headers, $encoded);
                return true;
            default:
                $extra = [];
                foreach ($headers as $name => $value) {
                    if ($name !== 'To' && $name !== 'Subject') {
                        $extra[] = "$name: $value";
                    }
                }
                $sent = mail($to, $headers['Subject'], $encoded, implode("\r\n", $extra), '-f' . $from);
                if (!$sent) {
                    ao_log('mail', "mail() refused: $subject");
                }
                return $sent;
        }
    } catch (Throwable $e) {
        ao_log('mail', "Not sent: $subject — " . $e->getMessage());
        return false;
    }
}

/** Minimal SMTP client (SSL on 465 or STARTTLS on 587) — no Composer needed. */
function ao_smtp_send(array $smtp, string $from, string $to, array $headers, string $body): void
{
    $host = (string) ($smtp['host'] ?? '');
    $port = (int) ($smtp['port'] ?? 465);
    if ($host === '' || ao_unset($smtp['password'] ?? '')) {
        throw new RuntimeException('SMTP settings are incomplete');
    }
    $implicitTls = $port === 465;
    $socket = stream_socket_client(
        ($implicitTls ? 'ssl://' : 'tcp://') . "$host:$port",
        $errno,
        $errstr,
        20,
        STREAM_CLIENT_CONNECT,
        stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]),
    );
    if (!$socket) {
        throw new RuntimeException("SMTP connection failed: $errstr");
    }
    stream_set_timeout($socket, 20);

    $expect = function (array $codes) use ($socket): void {
        $reply = '';
        while (($line = fgets($socket, 1024)) !== false) {
            $reply .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') {
                break;
            }
        }
        if (!in_array((int) substr($reply, 0, 3), $codes, true)) {
            throw new RuntimeException('SMTP said: ' . trim($reply));
        }
    };
    $send = function (string $command) use ($socket): void {
        fwrite($socket, $command . "\r\n");
    };

    $expect([220]);
    $send('EHLO ' . (parse_url(ao_config()['site_url'], PHP_URL_HOST) ?: 'localhost'));
    $expect([250]);
    if (!$implicitTls) {
        $send('STARTTLS');
        $expect([220]);
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('SMTP STARTTLS failed');
        }
        $send('EHLO ' . (parse_url(ao_config()['site_url'], PHP_URL_HOST) ?: 'localhost'));
        $expect([250]);
    }
    $send('AUTH LOGIN');
    $expect([334]);
    $send(base64_encode((string) ($smtp['username'] ?? $from)));
    $expect([334]);
    $send(base64_encode((string) $smtp['password']));
    $expect([235]);
    $send("MAIL FROM:<$from>");
    $expect([250]);
    $send("RCPT TO:<$to>");
    $expect([250, 251]);
    $send('DATA');
    $expect([354]);
    $message = '';
    foreach ($headers as $name => $value) {
        $message .= "$name: $value\r\n";
    }
    $message .= "\r\n" . $body;
    fwrite($socket, preg_replace('/^\./m', '..', $message) . "\r\n.\r\n");
    $expect([250]);
    $send('QUIT');
    fclose($socket);
}

function ao_order_summary_text(array $order): string
{
    $lines = [];
    foreach (json_decode($order['items'], true) ?: [] as $item) {
        $lines[] = sprintf('%d × %s (%s)  %s', $item['qty'], $item['name'], $item['pack'], ao_rupees((int) $item['lineTotal']));
    }
    $lines[] = '';
    $lines[] = 'Subtotal  ' . ao_rupees((int) $order['subtotal']);
    $lines[] = 'Delivery  ' . ((int) $order['shipping'] === 0 ? 'FREE' : ao_rupees((int) $order['shipping']));
    $lines[] = 'Total     ' . ao_rupees((int) $order['total']);
    $lines[] = '';
    $lines[] = 'Delivering to:';
    $lines[] = $order['customer_name'];
    $lines[] = $order['address_line1'];
    if ($order['address_line2'] !== '') {
        $lines[] = $order['address_line2'];
    }
    $lines[] = "{$order['city']}, {$order['state']} {$order['pincode']}";
    $lines[] = 'Phone: ' . $order['customer_phone'];
    if ($order['notes'] !== '') {
        $lines[] = '';
        $lines[] = 'Note: ' . $order['notes'];
    }
    return implode("\n", $lines);
}

/** Emails the customer and the store once per order, however often it is called. */
function ao_notify_order(array $order): void
{
    $claim = ao_db()->prepare('UPDATE orders SET emailed_at = ? WHERE id = ? AND emailed_at IS NULL');
    $claim->execute([date('c'), $order['id']]);
    if ($claim->rowCount() === 0) {
        return;
    }

    $config = ao_config();
    $cod = $order['payment_method'] === 'cod';
    $total = ao_rupees((int) $order['total']);
    $summary = ao_order_summary_text($order);

    ao_mail(
        $order['customer_email'],
        "Your Abhimanyu Organics order {$order['id']}",
        "Hello {$order['customer_name']},\n\n"
            . 'Thank you for your order. '
            . ($cod ? "You'll pay $total in cash when it arrives." : "We've received your payment of $total.")
            . "\n\nOrder {$order['id']}\n\n$summary\n\n"
            . "Follow your order: " . ao_order_link($order) . "\n\n"
            . "Questions? Call or WhatsApp " . AO_PHONE . ", reply to this email, or visit "
            . $config['site_url'] . "/support\n\n"
            . "Abhimanyu Organics\n457, Panihar Chak, Hisar, Haryana 125001\n",
        (string) $config['owner_email'],
    );

    ao_mail(
        (string) $config['owner_email'],
        "New order {$order['id']} · $total · " . ($cod ? 'Cash on Delivery' : 'Paid online'),
        "New order {$order['id']} (" . ($cod ? 'Cash on Delivery' : 'paid on Stripe') . ")\n\n"
            . "$summary\n\nEmail: {$order['customer_email']}\n\n"
            . 'Open in admin: ' . $config['site_url'] . '/api/admin.php?order=' . rawurlencode($order['id']) . "\n",
        $order['customer_email'],
    );
}
