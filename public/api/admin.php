<?php
declare(strict_types=1);

// /api/admin.php — the store's back office: orders, enquiries, setup check.
// Signs in with admin_password from private/config.php.

require __DIR__ . '/_lib.php';

header('Cache-Control: no-store');
header('X-Frame-Options: DENY');
header('X-Robots-Tag: noindex, nofollow');
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
header('Referrer-Policy: no-referrer');

set_exception_handler(function (Throwable $e): void {
    ao_log('admin', $e::class . ': ' . $e->getMessage());
    http_response_code(500);
    echo 'Something went wrong. Details are in private/store.log.';
});

const AO_ADMIN_STATUSES = [
    'awaiting_payment' => 'Awaiting payment',
    'paid' => 'Paid online',
    'cod_confirmed' => 'COD — to ship',
    'shipped' => 'Shipped',
    'delivered' => 'Delivered',
    'cancelled' => 'Cancelled',
    'payment_failed' => 'Payment failed',
    'expired' => 'Payment expired',
];

// Which manual moves make sense from each state.
const AO_ADMIN_MOVES = [
    'paid' => ['shipped', 'cancelled'],
    'cod_confirmed' => ['shipped', 'cancelled'],
    'shipped' => ['delivered', 'cancelled'],
    'delivered' => [],
    'cancelled' => [],
    'awaiting_payment' => ['cancelled'],
    'payment_failed' => ['cancelled'],
    'expired' => ['cancelled'],
];

function h(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function admin_time(string $iso): string
{
    return $iso === '' ? '' : date('d M Y, g:i a', strtotime($iso));
}

$config = ao_config();
$https = ($_SERVER['HTTPS'] ?? '') !== '' && $_SERVER['HTTPS'] !== 'off';
session_name('ao_admin');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/api/admin.php'), '/') . '/',
    'secure' => $https,
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

$passwordReady = !ao_unset($config['admin_password']) && strlen((string) $config['admin_password']) >= 12;
$signedIn = !empty($_SESSION['admin']) && $passwordReady;
$flash = '';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $action = ao_str($_POST, 'action', 20);

    if ($action === 'login' && $passwordReady) {
        ao_throttle('admin_login', 5, 900);
        if (hash_equals((string) $config['admin_password'], (string) ($_POST['password'] ?? ''))) {
            session_regenerate_id(true);
            $_SESSION['admin'] = true;
            $_SESSION['csrf'] = bin2hex(random_bytes(16));
            header('Location: admin.php', true, 303);
            exit;
        }
        $flash = 'That password is not right.';
    } elseif ($signedIn) {
        if (!hash_equals((string) ($_SESSION['csrf'] ?? ''), (string) ($_POST['csrf'] ?? ''))) {
            http_response_code(400);
            exit('This form expired. Go back, reload the page and try again.');
        }
        if ($action === 'logout') {
            $_SESSION = [];
            session_destroy();
            header('Location: admin.php', true, 303);
            exit;
        }
        if ($action === 'status') {
            $order = ao_find_order(ao_str($_POST, 'order', 40));
            $to = ao_str($_POST, 'status', 20);
            if ($order && in_array($to, AO_ADMIN_MOVES[$order['status']] ?? [], true)) {
                ao_transition($order, $to, [$order['status']]);
                ao_log('admin', "{$order['id']}: {$order['status']} → $to");
            }
            header('Location: admin.php?order=' . rawurlencode($order['id'] ?? ''), true, 303);
            exit;
        }
    }
}

$view = ao_str($_GET, 'view', 20) ?: 'orders';
$orderId = ao_str($_GET, 'order', 40);
$filter = ao_str($_GET, 'status', 20);

/* --------------------------------------------------------------- render --- */
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Admin · Abhimanyu Organics</title>
<style>
  :root { --ivory:#fffcf5; --card:#fffdf8; --ink:#2a1d10; --ink2:#574431; --muted:#7a6550; --gold:#b8893a; --gold-deep:#7c5a1c; --line:rgba(124,90,28,.18); --royal:#0e2a1c; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 15px/1.55 system-ui, "Segoe UI", Roboto, sans-serif; color: var(--ink); background: var(--ivory); }
  header { display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center; justify-content: space-between; padding: 14px 22px; color: #fbf1da; background: var(--royal); }
  header b { font-family: Georgia, serif; letter-spacing: .14em; text-transform: uppercase; }
  nav { display: flex; gap: 6px; flex-wrap: wrap; }
  nav a, .chip { padding: 7px 13px; border-radius: 999px; color: inherit; text-decoration: none; font-size: 13px; }
  nav a.on, nav a:hover { background: rgba(251,241,218,.14); }
  main { max-width: 1100px; margin: 0 auto; padding: 22px 16px 60px; }
  h1 { margin: 6px 0 18px; font-family: Georgia, serif; font-weight: 600; }
  h2 { margin: 26px 0 10px; font-family: Georgia, serif; font-weight: 600; font-size: 20px; }
  .card { background: var(--card); border-radius: 16px; box-shadow: 0 0 0 1px var(--line); padding: 18px 20px; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--gold-deep); }
  td small { display: block; color: var(--muted); }
  a { color: var(--gold-deep); }
  .status { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #f3e6c9; color: var(--gold-deep); white-space: nowrap; }
  .status.paid, .status.cod_confirmed { background: #e3f1e5; color: #1e6b33; }
  .status.shipped { background: #e4ecf7; color: #28508a; }
  .status.delivered { background: #e8e8e8; color: #444; }
  .status.cancelled, .status.payment_failed, .status.expired { background: #f7e3de; color: #8a2d1c; }
  .filters { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .filters .chip { color: var(--ink2); box-shadow: inset 0 0 0 1px var(--line); }
  .filters .chip.on { color: #fbf1da; background: var(--royal); box-shadow: none; }
  button, input[type=password] { font: inherit; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line); }
  button { cursor: pointer; background: var(--royal); color: #fbf1da; border: 0; }
  button.ghost { background: transparent; color: var(--ink); box-shadow: inset 0 0 0 1px var(--line); }
  button.danger { background: #8a2d1c; }
  .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
  .flash { padding: 10px 14px; border-radius: 10px; background: #f7e3de; color: #8a2d1c; }
  .ok { color: #1e6b33; } .bad { color: #8a2d1c; font-weight: 600; }
  pre { white-space: pre-wrap; margin: 0; font: inherit; }
  @media (max-width: 700px) { .hide-sm { display: none; } }
</style>
</head>
<body>
<header>
  <b>Abhimanyu Organics</b>
  <?php if ($signedIn): ?>
  <nav>
    <a href="admin.php" class="<?= $view === 'orders' ? 'on' : '' ?>">Orders</a>
    <a href="admin.php?view=enquiries" class="<?= $view === 'enquiries' ? 'on' : '' ?>">Enquiries</a>
    <a href="admin.php?view=setup" class="<?= $view === 'setup' ? 'on' : '' ?>">Setup check</a>
    <form method="post" style="display:inline">
      <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
      <button class="ghost" name="action" value="logout" style="color:#fbf1da;box-shadow:inset 0 0 0 1px rgba(251,241,218,.3);padding:6px 12px">Sign out</button>
    </form>
  </nav>
  <?php endif; ?>
</header>
<main>
<?php if (!$passwordReady): ?>
  <h1>Admin is not set up</h1>
  <div class="card">
    <p>Set <b>admin_password</b> in <code>private/config.php</code> to a password of at least 12 characters, then reload this page.</p>
  </div>

<?php elseif (!$signedIn): ?>
  <h1>Sign in</h1>
  <form method="post" class="card" style="max-width:420px">
    <?php if ($flash): ?><p class="flash"><?= h($flash) ?></p><?php endif; ?>
    <p><label>Password<br><input type="password" name="password" autocomplete="current-password" required style="width:100%"></label></p>
    <button name="action" value="login">Sign in</button>
  </form>

<?php elseif ($orderId !== ''):
    $o = ao_find_order($orderId);
    if (!$o): ?>
  <h1>Order not found</h1>
  <p><a href="admin.php">← All orders</a></p>
    <?php else: $items = json_decode($o['items'], true) ?: []; ?>
  <p><a href="admin.php">← All orders</a></p>
  <h1><?= h($o['id']) ?> <span class="status <?= h($o['status']) ?>"><?= h(AO_ADMIN_STATUSES[$o['status']] ?? $o['status']) ?></span></h1>
  <div class="grid">
    <div class="card">
      <h2 style="margin-top:0">Items</h2>
      <table>
        <?php foreach ($items as $item): ?>
        <tr><td><?= (int) $item['qty'] ?> × <?= h($item['name']) ?><small><?= h($item['pack']) ?> · <?= h(ao_rupees((int) $item['unitPrice'])) ?> each</small></td><td style="text-align:right"><?= h(ao_rupees((int) $item['lineTotal'])) ?></td></tr>
        <?php endforeach; ?>
        <tr><td>Delivery</td><td style="text-align:right"><?= (int) $o['shipping'] === 0 ? 'FREE' : h(ao_rupees((int) $o['shipping'])) ?></td></tr>
        <tr><td><b><?= $o['payment_method'] === 'cod' ? 'Collect on delivery' : 'Total' ?></b></td><td style="text-align:right"><b><?= h(ao_rupees((int) $o['total'])) ?></b></td></tr>
      </table>
    </div>
    <div class="card">
      <h2 style="margin-top:0">Customer</h2>
      <p><b><?= h($o['customer_name']) ?></b><br>
        <a href="tel:+91<?= h($o['customer_phone']) ?>">+91 <?= h($o['customer_phone']) ?></a> ·
        <a href="https://wa.me/91<?= h($o['customer_phone']) ?>">WhatsApp</a><br>
        <a href="mailto:<?= h($o['customer_email']) ?>"><?= h($o['customer_email']) ?></a></p>
      <p><?= h($o['address_line1']) ?><?php if ($o['address_line2'] !== ''): ?><br><?= h($o['address_line2']) ?><?php endif; ?><br>
        <?= h($o['city']) ?>, <?= h($o['state']) ?> <?= h($o['pincode']) ?></p>
      <?php if ($o['notes'] !== ''): ?><p><b>Note:</b></p><pre><?= h($o['notes']) ?></pre><?php endif; ?>
    </div>
    <div class="card">
      <h2 style="margin-top:0">Payment &amp; history</h2>
      <p><?= $o['payment_method'] === 'cod' ? 'Cash on Delivery' : 'Stripe' ?><br>
        <small>Placed <?= h(admin_time($o['created_at'])) ?></small>
        <?php if ($o['paid_at']): ?><br><small>Paid <?= h(admin_time($o['paid_at'])) ?></small><?php endif; ?>
        <br><small>Updated <?= h(admin_time($o['updated_at'])) ?></small></p>
      <?php if ($o['stripe_payment_intent']): ?><p><small>Stripe payment: <?= h($o['stripe_payment_intent']) ?></small></p><?php endif; ?>
      <p><small>Emails <?= $o['emailed_at'] ? 'sent ' . h(admin_time($o['emailed_at'])) : 'not sent yet' ?></small></p>
      <?php $moves = AO_ADMIN_MOVES[$o['status']] ?? []; if ($moves): ?>
      <?php foreach (array_diff($moves, ['cancelled']) as $move): ?>
      <form method="post" class="row" style="margin-bottom:10px">
        <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
        <input type="hidden" name="action" value="status">
        <input type="hidden" name="order" value="<?= h($o['id']) ?>">
        <button name="status" value="<?= h($move) ?>">Mark <?= h(strtolower(AO_ADMIN_STATUSES[$move])) ?></button>
      </form>
      <?php endforeach; ?>
      <?php if (in_array('cancelled', $moves, true)): ?>
      <!-- A required tick box rather than a JavaScript confirm(): this page's
           security policy allows no scripts at all. -->
      <form method="post" class="row">
        <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
        <input type="hidden" name="action" value="status">
        <input type="hidden" name="order" value="<?= h($o['id']) ?>">
        <label><input type="checkbox" required> Yes, cancel</label>
        <button name="status" value="cancelled" class="danger">Cancel order</button>
      </form>
      <?php endif; ?>
      <?php if ($o['payment_method'] === 'stripe' && in_array($o['status'], ['paid', 'shipped'], true)): ?>
      <p><small>Cancelling here does not refund the customer — issue refunds in the Stripe dashboard.</small></p>
      <?php endif; endif; ?>
    </div>
  </div>
    <?php endif; ?>

<?php elseif ($view === 'enquiries'):
    $rows = ao_db()->query('SELECT * FROM enquiries ORDER BY id DESC LIMIT 200')->fetchAll(); ?>
  <h1>Enquiries</h1>
  <?php if (!$rows): ?><div class="card">No enquiries yet.</div><?php endif; ?>
  <?php foreach ($rows as $r): ?>
  <div class="card">
    <div class="row" style="justify-content:space-between"><b><?= h($r['business']) ?> · <?= h($r['type']) ?></b><small><?= h(admin_time($r['created_at'])) ?></small></div>
    <p><?= h($r['name']) ?> · <a href="tel:<?= h($r['phone']) ?>"><?= h($r['phone']) ?></a> · <a href="mailto:<?= h($r['email']) ?>"><?= h($r['email']) ?></a></p>
    <?php if ($r['message'] !== ''): ?><pre><?= h($r['message']) ?></pre><?php endif; ?>
  </div>
  <?php endforeach; ?>

<?php elseif ($view === 'setup'):
    $dir = ao_private_dir();
    $checks = [
        ['Private folder is writable', is_dir($dir) && is_writable($dir)],
        ['PHP ' . PHP_VERSION . ' (8.1 or newer)', version_compare(PHP_VERSION, '8.1.0', '>=')],
        ['pdo_sqlite extension', extension_loaded('pdo_sqlite')],
        ['curl extension', function_exists('curl_init')],
        ['openssl extension', extension_loaded('openssl')],
        ['site_url is set', $config['site_url'] !== '' && str_starts_with($config['site_url'], 'http')],
        ['Stripe secret key is set', !ao_unset($config['stripe_secret_key'])],
        ['Stripe webhook secret is set', !ao_unset($config['stripe_webhook_secret'])],
        ['Owner email is valid', ao_valid_email((string) $config['owner_email'])],
        ['Sender email is valid', ao_valid_email((string) $config['mail_from'])],
    ];
    $mode = str_starts_with((string) $config['stripe_secret_key'], 'sk_live_') ? 'LIVE — real payments' : (str_starts_with((string) $config['stripe_secret_key'], 'sk_test_') ? 'TEST — no real money' : 'not set'); ?>
  <h1>Setup check</h1>
  <div class="card">
    <table>
      <?php foreach ($checks as [$label, $pass]): ?>
      <tr><td><?= h($label) ?></td><td class="<?= $pass ? 'ok' : 'bad' ?>"><?= $pass ? '✓ OK' : '✗ Fix this' ?></td></tr>
      <?php endforeach; ?>
      <tr><td>Stripe mode</td><td><b><?= h($mode) ?></b></td></tr>
      <tr><td>Email delivery</td><td><?= h($config['mail_transport']) ?></td></tr>
      <tr><td>Webhook address for Stripe</td><td><code><?= h($config['site_url'] . '/api/stripe-webhook.php') ?></code></td></tr>
    </table>
  </div>
  <?php $log = @file($dir . '/store.log') ?: []; if ($log): ?>
  <h2>Recent log</h2>
  <div class="card"><pre><?= h(implode('', array_slice($log, -30))) ?></pre></div>
  <?php endif; ?>

<?php else:
    $where = array_key_exists($filter, AO_ADMIN_STATUSES) ? 'WHERE status = ?' : '';
    $stmt = ao_db()->prepare("SELECT * FROM orders $where ORDER BY created_at DESC LIMIT 300");
    $stmt->execute($where ? [$filter] : []);
    $rows = $stmt->fetchAll();
    $counts = [];
    foreach (ao_db()->query('SELECT status, COUNT(*) AS n FROM orders GROUP BY status') as $c) {
        $counts[$c['status']] = (int) $c['n'];
    } ?>
  <h1>Orders</h1>
  <div class="filters">
    <a class="chip <?= $filter === '' ? 'on' : '' ?>" href="admin.php">All</a>
    <?php foreach (['cod_confirmed', 'paid', 'shipped', 'delivered', 'awaiting_payment', 'cancelled'] as $s): ?>
    <a class="chip <?= $filter === $s ? 'on' : '' ?>" href="admin.php?status=<?= h($s) ?>"><?= h(AO_ADMIN_STATUSES[$s]) ?> (<?= $counts[$s] ?? 0 ?>)</a>
    <?php endforeach; ?>
  </div>
  <div class="card" style="padding:6px 12px">
    <?php if (!$rows): ?><p>No orders here yet.</p><?php else: ?>
    <table>
      <tr><th>Order</th><th>Customer</th><th class="hide-sm">Items</th><th>Total</th><th>Status</th></tr>
      <?php foreach ($rows as $r): $n = array_sum(array_column(json_decode($r['items'], true) ?: [], 'qty')); ?>
      <tr>
        <td><a href="admin.php?order=<?= h(rawurlencode($r['id'])) ?>"><?= h($r['id']) ?></a><small><?= h(admin_time($r['created_at'])) ?></small></td>
        <td><?= h($r['customer_name']) ?><small><?= h($r['city']) ?> · <?= h($r['customer_phone']) ?></small></td>
        <td class="hide-sm"><?= $n ?> item<?= $n === 1 ? '' : 's' ?></td>
        <td><?= h(ao_rupees((int) $r['total'])) ?><small><?= $r['payment_method'] === 'cod' ? 'COD' : 'Online' ?></small></td>
        <td><span class="status <?= h($r['status']) ?>"><?= h(AO_ADMIN_STATUSES[$r['status']] ?? $r['status']) ?></span></td>
      </tr>
      <?php endforeach; ?>
    </table>
    <?php endif; ?>
  </div>
<?php endif; ?>
</main>
</body>
</html>
