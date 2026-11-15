<?php
// Receives the website contact form and emails it to the studio.
// Static hosting cannot run server code, so Hostinger runs this one small PHP file.
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

const MAIL_TO = 'info@bnbdesignstudio.net';
const MAIL_FROM = 'no-reply@bnbdesignstudio.net'; // must be a mailbox on this domain so mail is not marked as spam

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

/** Trim, cap the length and remove line breaks (they could be used to inject extra mail headers). */
function field(string $key, int $max): string
{
    $value = trim((string)($_POST[$key] ?? ''));
    $value = preg_replace('/[\r\n]+/', ' ', $value) ?? '';
    return mb_substr($value, 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'Method not allowed']);
}

// Hidden "company" field: people leave it empty, spam bots fill it. Pretend it worked.
if (!empty($_POST['company'])) {
    respond(200, ['ok' => true]);
}

$name = field('name', 100);
$phone = field('phone', 40);
$email = field('email', 120);
$type = field('type', 60);
$message = mb_substr(trim((string)($_POST['message'] ?? '')), 0, 3000);

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, ['ok' => false, 'error' => 'Please add your name and a valid email.']);
}

$subject = 'Website enquiry from ' . $name;
$body = "Name: $name\nPhone: $phone\nEmail: $email\nProject type: $type\n\nMessage:\n$message\n";
$headers = implode("\r\n", [
    'From: ' . MAIL_FROM,
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
]);

if (!mail(MAIL_TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers)) {
    respond(500, ['ok' => false, 'error' => 'Could not send the message.']);
}

respond(200, ['ok' => true]);
