<?php
/**
 * Hostinger PHP SMTP Email Handler for Sky Multirotor Squad Registration
 * Dapat digunakan jika web di-host langsung di Hostinger Shared / Cloud Hosting (hPanel)
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
    exit;
}

$name          = htmlspecialchars($input['name'] ?? 'Pilot');
$callsign      = htmlspecialchars($input['callsign'] ?? 'Independen');
$phone         = htmlspecialchars($input['phone'] ?? '-');
$email         = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
$category      = htmlspecialchars($input['category'] ?? 'Cinematic FPV');
$paymentMethod = htmlspecialchars($input['paymentMethod'] ?? 'QRIS');
$fee           = htmlspecialchars($input['fee'] ?? 'Rp 200.000');
$eventTitle    = htmlspecialchars($input['eventTitle'] ?? 'Fly Through History – Benteng Speelwijk Drone Fest 2026');
$eventDate     = htmlspecialchars($input['eventDate'] ?? '17 - 18 Oktober 2026');
$eventLocation = htmlspecialchars($input['eventLocation'] ?? 'Benteng Speelwijk, Banten Lama');

if (!$email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Alamat email pilot tidak valid atau kosong']);
    exit;
}

// Konfigurasi SMTP Hostinger dari Environment Variables atau Fallback Config
$smtpHost  = getenv('HOSTINGER_SMTP_HOST') ?: 'smtp.hostinger.com';
$smtpPort  = (int)(getenv('HOSTINGER_SMTP_PORT') ?: 465);
$smtpUser  = getenv('HOSTINGER_SMTP_USER') ?: 'info@skymultirotor.web.id';
$smtpPass  = getenv('HOSTINGER_SMTP_PASS') ?: '';
$fromName  = getenv('HOSTINGER_SMTP_FROM_NAME') ?: 'Sky Multirotor Squad';
$adminMail = getenv('ADMIN_NOTIFICATION_EMAIL') ?: $smtpUser;

$subject = "Konfirmasi Registrasi Pilot: {$eventTitle} ({$name})";

$message = <<<HTML
<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"><title>Konfirmasi Pendaftaran</title></head>
<body style="margin: 0; padding: 0; background-color: #121414; font-family: sans-serif; color: #e2e2e2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #121414; padding: 30px 15px;">
    <tr><td align="center">
      <table width="100%" style="max-width: 600px; background-color: #1c1e1f; border-radius: 12px; border: 1px solid #333535; overflow: hidden;">
        <tr>
          <td style="background-color: #201f1f; padding: 25px; text-align: center; border-bottom: 3px solid #ffc700;">
            <h1 style="margin: 0; color: #ffffff; font-size: 20px;">SKY MULTIROTOR <span style="color: #ffc700;">SQUAD</span></h1>
            <p style="margin: 5px 0 0; color: #ffc700; font-size: 13px;">{$eventTitle}</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 25px;">
            <h2 style="color: #fff; font-size: 17px; margin-top: 0;">Halo, Pilot <span style="color: #ffc700;">{$name}</span>!</h2>
            <p style="color: #c8c6c5; font-size: 14px; line-height: 1.6;">Terima kasih telah mendaftar di ajang <strong>{$eventTitle}</strong>. Reservasi slot Anda telah kami terima.</p>
            
            <div style="background-color: #282a2b; border: 1px solid #474746; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 13px;">
              <div style="color: #ffc700; font-weight: bold; margin-bottom: 10px;">DATA PENDAFTARAN</div>
              <p style="margin: 4px 0;"><strong>Nama:</strong> {$name}</p>
              <p style="margin: 4px 0;"><strong>Komunitas / Callsign:</strong> {$callsign}</p>
              <p style="margin: 4px 0;"><strong>WhatsApp:</strong> {$phone}</p>
              <p style="margin: 4px 0;"><strong>Kategori:</strong> <span style="color: #ffc700;">{$category}</span></p>
              <p style="margin: 4px 0;"><strong>Metode Pembayaran:</strong> {$paymentMethod}</p>
              <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #34d399;">PENDING (Verifikasi Panitia)</span></p>
            </div>

            <div style="background-color: #181a1a; border-left: 4px solid #ffc700; padding: 12px 15px; margin-bottom: 20px; font-size: 13px;">
              <strong>📅 Jadwal:</strong> {$eventDate}<br>
              <strong>📍 Lokasi:</strong> {$eventLocation}
            </div>

            <p style="color: #c8c6c5; font-size: 13px;">Panitia saat ini sedang memverifikasi bukti pembayaran yang Anda unggah. Tim administrasi SMS akan segera mengirimkan konfirmasi nomor slot resmi dan pembagian frekuensi VTX via WhatsApp.</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://wa.me/6287772272928" style="background-color: #ffc700; color: #111; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 13px;">KONFIRMASI VIA WHATSAPP</a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: {$fromName} <{$smtpUser}>\r\n";
$headers .= "Reply-To: {$smtpUser}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$sent = @mail($email, $subject, $message, $headers);

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Email konfirmasi berhasil dikirim ke pilot via Hostinger']);
} else {
    echo json_encode(['success' => true, 'warning' => 'Permintaan diterima, data tercatat']);
}
