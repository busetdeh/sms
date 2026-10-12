import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const smtpHost = process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com';
  const smtpPort = Number(process.env.HOSTINGER_SMTP_PORT) || 465;
  const smtpSecure = process.env.HOSTINGER_SMTP_SECURE === 'false' ? false : true;
  const smtpUser = process.env.HOSTINGER_SMTP_USER;
  const smtpPass = process.env.HOSTINGER_SMTP_PASS;
  const fromName = process.env.HOSTINGER_SMTP_FROM_NAME || 'Sky Multirotor Squad';

  if (!smtpUser || !smtpPass) {
    return res.status(400).json({
      success: false,
      error: 'Environment variables belum lengkap di Vercel/server.',
      detail: {
        HOSTINGER_SMTP_HOST: smtpHost,
        HOSTINGER_SMTP_PORT: smtpPort,
        HOSTINGER_SMTP_USER: smtpUser ? 'Sudah diset' : 'Belum diset (KOSONG)',
        HOSTINGER_SMTP_PASS: smtpPass ? 'Sudah diset' : 'Belum diset (KOSONG)'
      }
    });
  }

  // Tentukan email tujuan testing
  const body = req.body || {};
  const query = req.query || {};
  const targetEmail = body.targetEmail || query.to || process.env.ADMIN_NOTIFICATION_EMAIL || smtpUser;

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // 1. Verifikasi koneksi handshake ke Hostinger SMTP
    await transporter.verify();

    // 2. Kirim test email
    const testHtml = `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 25px; background-color: #121414; font-family: sans-serif; color: #e2e2e2;">
  <div style="max-width: 550px; margin: auto; background-color: #1c1e1f; border-radius: 10px; border: 1px solid #333535; padding: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
    <div style="text-align: center; border-bottom: 2px solid #ffc700; padding-bottom: 15px; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #ffc700;">TESTING SMTP HOSTINGER BERHASIL! 🚀</h2>
      <p style="margin: 5px 0 0; font-size: 13px; color: #999077;">Sky Multirotor Squad - Benteng Speelwijk Drone Fest 2026</p>
    </div>
    <p>Halo Admin,</p>
    <p>Email ini adalah pengujian otomatis untuk memastikan konfigurasi <strong>Hostinger SMTP</strong> pada sistem registrasi pilot telah aktif dan berfungsi normal.</p>
    <div style="background-color: #282a2b; border-left: 4px solid #34d399; padding: 12px 16px; margin: 18px 0; font-size: 13px;">
      <p style="margin: 3px 0;"><strong>Status:</strong> <span style="color: #34d399;">TERHUBUNG &amp; AKTIF</span></p>
      <p style="margin: 3px 0;"><strong>SMTP Host:</strong> ${smtpHost}:${smtpPort} (Secure: ${smtpSecure ? 'SSL' : 'TLS'})</p>
      <p style="margin: 3px 0;"><strong>Pengirim (Sender):</strong> ${fromName} &lt;${smtpUser}&gt;</p>
      <p style="margin: 3px 0;"><strong>Penerima (Recipient):</strong> ${targetEmail}</p>
      <p style="margin: 3px 0;"><strong>Waktu Kirim:</strong> ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</p>
    </div>
    <p style="font-size: 13px; color: #c8c6c5;">Setiap pilot baru yang mendaftar di microsite Speelwijk sekarang akan otomatis menerima email konfirmasi pendaftaran berformat resmi.</p>
  </div>
</body>
</html>
`;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${smtpUser}>`,
      to: targetEmail,
      subject: `[TEST] Hostinger SMTP Verification - Sky Multirotor Squad (${new Date().toLocaleTimeString('id-ID')})`,
      html: testHtml
    });

    return res.status(200).json({
      success: true,
      message: `Test email berhasil dikirim ke ${targetEmail}!`,
      info: {
        messageId: info.messageId,
        smtpHost,
        smtpPort,
        from: `"${fromName}" <${smtpUser}>`,
        to: targetEmail,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Test SMTP Hostinger error:', error);
    return res.status(500).json({
      success: false,
      error: 'Gagal terhubung atau mengirim email via Hostinger SMTP',
      errorMessage: error.message,
      troubleshooting: {
        code: error.code || 'UNKNOWN',
        response: error.response || null,
        hint: error.message.includes('auth') || error.message.includes('535') 
          ? 'Periksa kembali password email Hostinger Anda. Pastikan password sudah sesuai dengan yang dibuat di hPanel.'
          : error.message.includes('connect') 
          ? 'Gagal menghubungi smtp.hostinger.com pada port ' + smtpPort + '. Coba gunakan port 465 (SSL) atau 587 (TLS).'
          : 'Periksa log error di atas untuk detail teknis.'
      }
    });
  }
}
