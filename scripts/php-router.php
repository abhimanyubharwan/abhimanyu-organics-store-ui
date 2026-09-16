<?php
// Runs the built site with PHP's own web server, standing in for the rules in
// public/.htaccess and public/api/.htaccess that Hostinger applies:
//
//   npm run build
//   AO_PRIVATE_DIR=/path/to/test-private php -S 127.0.0.1:8080 -t dist scripts/php-router.php
//
// AO_PRIVATE_DIR points at a folder holding a test config.php (use
// 'mail_transport' => 'log' so nothing is really emailed).

$path = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
$root = $_SERVER['DOCUMENT_ROOT'];

// Helpers in api/ are never served directly.
if (preg_match('#^/api/_#', $path)) {
    http_response_code(403);
    exit('Forbidden');
}

if ($path === '/' || is_file($root . $path)) {
    return false; // let the built-in server send the file, or run the PHP script
}

// A missing file keeps a real 404; any other path is a page inside the app.
if (preg_match('/\.[A-Za-z0-9]+$/', $path)) {
    http_response_code(404);
    exit('Not found');
}

header('Content-Type: text/html; charset=utf-8');
readfile($root . '/404.html');
