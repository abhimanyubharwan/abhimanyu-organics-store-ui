<?php
// Abhimanyu Organics — private store settings.
//
// On Hostinger: open File Manager, go UP one level from public_html (to the
// folder that contains it), create a folder named "private", and save a copy
// of this file inside it as config.php. Then fill in the values below.
//
//   domains/<your-site>/public_html/   ← the website
//   domains/<your-site>/private/       ← config.php lives here, never online
//
// Never put this file inside public_html and never commit the real one to
// git: it holds your Stripe secret key and your admin password.
//
// Only change the text between the quotes; keep the quotes and the comma at
// the end of each line. Don't use ' or \ inside passwords — they end the text
// early and the store will stop with an error in private/store.log.

return [
    // The address customers use, with https:// and no slash at the end.
    'site_url' => 'https://new.abhimanyuorganics.com',

    // Stripe dashboard → API keys (dashboard.stripe.com/test/apikeys while
    // testing) → Standard keys → Secret key → reveal and copy.
    // Start with the TEST key (sk_test_…). Switch to the LIVE key (sk_live_…)
    // only when you are ready to take real payments.
    'stripe_secret_key' => 'sk_test_REPLACE_ME',

    // Stripe dashboard → Webhooks (dashboard.stripe.com/test/webhooks while
    // testing) → Create an event destination → Your account → tick the events
    //   checkout.session.completed
    //   checkout.session.async_payment_succeeded
    //   checkout.session.async_payment_failed
    //   checkout.session.expired
    // → Continue → Webhook endpoint → Continue → Endpoint URL:
    //   https://new.abhimanyuorganics.com/api/stripe-webhook.php
    // Once it's created, reveal its Signing secret (whsec_…) and copy it here.
    // Test mode and live mode each have their own endpoint and secret.
    'stripe_webhook_secret' => 'whsec_REPLACE_ME',

    // Where new orders and enquiries are emailed.
    'owner_email' => 'organicsabhimanyu@gmail.com',

    // How emails are sent:
    //   'smtp' — through a mailbox on your domain. Recommended: most reliable.
    //            Create the mailbox in hPanel → Emails, then fill in 'smtp'.
    //   'mail' — PHP's built-in mail(). mail_from must still be a mailbox you
    //            created in hPanel, and messages are more likely to go to spam.
    //   'log'  — send nothing; write emails to private/outbox.log (testing).
    'mail_transport' => 'smtp',
    'mail_from' => 'orders@abhimanyuorganics.com',
    'mail_from_name' => 'Abhimanyu Organics',
    'smtp' => [
        'host' => 'smtp.hostinger.com',
        'port' => 465,
        'username' => 'orders@abhimanyuorganics.com',
        'password' => 'REPLACE_ME',
    ],

    // Password for https://new.abhimanyuorganics.com/api/admin.php
    // At least 12 characters. Use one you don't use anywhere else.
    'admin_password' => 'REPLACE_WITH_A_LONG_PASSWORD',
];
