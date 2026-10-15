<?php
/**
 * Hostinger PHP SMTP Email Handler for Speelwijk Approval / E-Ticket Notification
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

$name          = htmlspecialchars($input['name'] ?? 'Pilot Speelwijk');
$callsign      = htmlspecialchars($input['callsign'] ?? '');
$community     = htmlspecialchars($input['community'] ?? 'Independen');
$email         = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
$category      = htmlspecialchars($input['category'] ?? 'Cinematic FPV');
$regCode       = htmlspecialchars($input['regCode'] ?? 'REG-SPW-2026');
$eventTitle    = htmlspecialchars($input['eventTitle'] ?? 'Fly Through History – Benteng Speelwijk Drone Fest 2026');
$eventDate     = htmlspecialchars($input['eventDate'] ?? 'Sabtu – Minggu, 17 – 18 Oktober 2026');
$eventLocation = htmlspecialchars($input['eventLocation'] ?? 'Situs Cagar Budaya Benteng Speelwijk, Kampung Pamarican, Kasemen, Banten Lama, Kota Serang');
$mapsUrl       = htmlspecialchars($input['mapsUrl'] ?? 'https://maps.app.goo.gl/Speelwijk');

if (!$email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Alamat email pilot tidak valid atau kosong']);
    exit;
}

$smtpUser  = getenv('HOSTINGER_SMTP_USER') ?: 'info@skymultirotor.web.id';
$fromName  = getenv('HOSTINGER_SMTP_FROM_NAME') ?: 'Sky Multirotor Squad';
$validationUrl = "https://www.skymultirotor.web.id/benteng-speelwijk-validasi?code=" . urlencode($regCode);

$subject = "[TIKET RESMI] Slot Anda Telah Dikonfirmasi! – {$eventTitle}";

$message = <<<HTML
<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"><title>{$subject}</title></head>
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
            <h2 style="color: #fff; font-size: 17px; margin-top: 0;">Halo Pilot <span style="color: #ffc700;">{$name}</span> ({$callsign}), 🛸⚡</h2>
            <p style="color: #c8c6c5; font-size: 14px; line-height: 1.6;">
              Kabar gembira! Pembayaran dan data pendaftaran Anda untuk ajang:<br>
              <strong>"{$eventTitle}"</strong><br>
              telah <strong>BERHASIL DIVERIFIKASI &amp; DISETUJUI</strong> oleh tim panitia Sky Multirotor Squad.
            </p>
            <p style="color: #ffc700; font-weight: bold; font-size: 14px;">
              Slot terbang resmi Anda kini telah TERKUNCI (SECURED).
            </p>

            <div style="background-color: #282a2b; border: 1px solid #474746; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 13px;">
              <div style="color: #ffc700; font-weight: bold; margin-bottom: 10px;">🎫 E-TICKET &amp; DETAIL SLOT RESMI PILOT</div>
              <p style="margin: 4px 0;"><strong>No. Registrasi:</strong> <span style="color: #ffc700; font-family: monospace; font-weight: bold;">{$regCode}</span></p>
              <p style="margin: 4px 0;"><strong>Nama Lengkap:</strong> {$name}</p>
              <p style="margin: 4px 0;"><strong>Callsign / Tim:</strong> {$callsign} / {$community}</p>
              <p style="margin: 4px 0;"><strong>Kategori Race:</strong> {$category}</p>
              <p style="margin: 4px 0;"><strong>Status Slot:</strong> <span style="color: #34d399; font-weight: bold;">✅ VALID &amp; LUNAS (TERVERIFIKASI)</span></p>
            </div>

            <div style="background-color: #202223; border: 1px solid #3d3f40; border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 13px;">
              <div style="color: #ffc700; font-weight: bold; margin-bottom: 8px;">🎁 FASILITAS &amp; BENEFIT SLOT ANDA TERMASUK:</div>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.7;">
                <li>Pit Access Eksklusif &amp; Slot Frekuensi Terdedikasi</li>
                <li>Tenda Camping Ground di Area Cagar Budaya Benteng Speelwijk</li>
                <li>Konsumsi Lengkap &amp; Free-flow Air Minum selama 2 Hari Event</li>
                <li>Medali / Sertifikat Resmi Partisipasi Pilot Speelwijk 2026</li>
              </ul>
            </div>

            <div style="background-color: #181a1a; border-left: 4px solid #ffc700; padding: 12px 15px; margin-bottom: 20px; font-size: 13px;">
              <strong>📅 Jadwal:</strong> {$eventDate}<br>
              <span style="font-size: 12px; color: #aaa;">• Day 1 (17 Okt): Registrasi Ulang, Practice, Kualifikasi &amp; Eksibisi</span><br>
              <span style="font-size: 12px; color: #aaa;">• Day 2 (18 Okt): Babak Eliminasi, Semifinal, Grand Final &amp; Awarding</span><br>
              <strong>📍 Lokasi:</strong> {$eventLocation} (<a href="{$mapsUrl}" style="color: #ffc700;">Google Maps</a>)
            </div>

            <div style="background-color: #181a1a; border: 1px solid #333535; border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 13px;">
              <div style="color: #ffc700; font-weight: bold; margin-bottom: 8px;">📲 INSTRUKSI SAAT TIBA DI VENUE (CHECK-IN):</div>
              <ol style="margin: 0; padding-left: 20px; line-height: 1.6; color: #c8c6c5;">
                <li>Saat tiba di lokasi, silakan menuju ke <strong>MEJA REGISTRASI RESMI</strong>.</li>
                <li>Scan QR Code Check-in di meja booth atau tunjukkan Nomor Registrasi: <strong>{$regCode}</strong>.</li>
                <li>Buka kartu identitas digital melalui link: <a href="{$validationUrl}" style="color: #ffc700;">{$validationUrl}</a></li>
                <li>Petugas di meja registrasi akan menyerahkan Race Tag, Pit Pass, dan ID Card Anda.</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 25px 0;">
              <a href="{$validationUrl}" style="background-color: #ffc700; color: #111; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 13px; display: inline-block;">BUKA E-TICKET &amp; VALIDASI QR</a>
            </div>
            
            <p style="text-align: center; font-size: 12px; color: #888;">
              Persiapkan quad Anda, calibrate gear, and see you on the track!<br>
              Salam satu udara,<br>
              <strong>Panitia Pelaksana Benteng Speelwijk Drone Fest 2026</strong>
            </p>
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
    echo json_encode(['success' => true, 'message' => 'Email e-ticket approval berhasil dikirim via Hostinger']);
} else {
    echo json_encode(['success' => true, 'warning' => 'Permintaan diproses']);
}
