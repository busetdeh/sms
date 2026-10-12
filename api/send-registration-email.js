import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      name,
      callsign,
      phone,
      email,
      category,
      paymentMethod,
      fee = 'Rp 200.000',
      eventTitle = 'Fly Through History – Benteng Speelwijk Drone Fest 2026',
      eventDate = '17 - 18 Oktober 2026',
      eventLocation = 'Benteng Speelwijk, Banten Lama'
    } = req.body || {};

    if (!email || email === '-' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Alamat email pilot tidak valid atau belum diisi.'
      });
    }

    const smtpHost = process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com';
    const smtpPort = Number(process.env.HOSTINGER_SMTP_PORT) || 465;
    const smtpSecure = process.env.HOSTINGER_SMTP_SECURE === 'false' ? false : true; // 465 = true, 587 = false
    const smtpUser = process.env.HOSTINGER_SMTP_USER;
    const smtpPass = process.env.HOSTINGER_SMTP_PASS;
    const fromName = process.env.HOSTINGER_SMTP_FROM_NAME || 'Sky Multirotor Squad';
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || smtpUser;

    if (!smtpUser || !smtpPass) {
      console.warn('Hostinger SMTP credentials belum diset di environment variables.');
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi SMTP Hostinger belum lengkap di server. Pastikan HOSTINGER_SMTP_USER dan HOSTINGER_SMTP_PASS sudah diisi.'
      });
    }

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

    // 1. Email Konfirmasi untuk Pilot
    const pilotHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Konfirmasi Pendaftaran - ${eventTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121414; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e2e2;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #121414; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #1c1e1f; border-radius: 12px; border: 1px solid #333535; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #201f1f 0%, #121414 100%); padding: 30px 25px; text-align: center; border-bottom: 3px solid #ffc700;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                SKY MULTIROTOR <span style="color: #ffc700;">SQUAD</span>
              </h1>
              <p style="margin: 6px 0 0 0; color: #ffc700; font-size: 13px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">
                ${eventTitle}
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 25px;">
              <h2 style="margin: 0 0 15px 0; color: #ffffff; font-size: 18px; font-weight: 700;">
                Halo, Pilot <span style="color: #ffc700;">${name}</span>! 🛸
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #c8c6c5;">
                Terima kasih telah mendaftar di ajang <strong>${eventTitle}</strong>. Data registrasi dan reservasi slot Anda telah berhasil kami terima di sistem kami.
              </p>

              <!-- Registration Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #282a2b; border-radius: 8px; border: 1px solid #474746; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 11px; font-weight: 700; color: #ffc700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #3d3f40; padding-bottom: 6px;">
                      DATA REGISTRASI PILOT
                    </div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="4" style="font-size: 13px;">
                      <tr>
                        <td width="38%" style="color: #999077;">Nama Lengkap:</td>
                        <td style="color: #ffffff; font-weight: 600;">${name}</td>
                      </tr>
                      <tr>
                        <td style="color: #999077;">Komunitas / Callsign:</td>
                        <td style="color: #ffffff; font-weight: 600;">${callsign || 'Independen'}</td>
                      </tr>
                      <tr>
                        <td style="color: #999077;">WhatsApp:</td>
                        <td style="color: #ffffff;">${phone}</td>
                      </tr>
                      <tr>
                        <td style="color: #999077;">Kategori Lomba:</td>
                        <td style="color: #ffc700; font-weight: 600;">${category}</td>
                      </tr>
                      <tr>
                        <td style="color: #999077;">Metode Pembayaran:</td>
                        <td style="color: #ffffff;">${paymentMethod}</td>
                      </tr>
                      <tr>
                        <td style="color: #999077;">Biaya Pendaftaran:</td>
                        <td style="color: #ffffff; font-weight: 700;">${fee}</td>
                      </tr>
                      <tr>
                        <td style="color: #999077;">Status Slot:</td>
                        <td style="color: #34d399; font-weight: 700;">PENDING (Verifikasi Panitia)</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Event Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #181a1a; border-radius: 8px; border-left: 4px solid #ffc700; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 15px 18px;">
                    <p style="margin: 0; font-size: 12px; color: #ffc700; font-weight: 700; text-transform: uppercase;">
                      📅 JADWAL & LOKASI KEGIATAN:
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 13px; color: #ffffff;">
                      <strong>${eventDate}</strong> (08:00 WIB – Selesai)<br>
                      📍 <strong>${eventLocation}</strong>, Kasemen, Kota Serang, Banten
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 25px 0; font-size: 13px; line-height: 1.6; color: #c8c6c5;">
                Panitia saat ini sedang memverifikasi bukti pembayaran yang Anda unggah. Tim administrasi SMS akan segera mengirimkan konfirmasi nomor slot resmi dan informasi pembagian frekuensi VTX melalui WhatsApp.
              </p>

              <!-- CTA Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 5px 0 20px 0;">
                    <a href="https://wa.me/6287772272928?text=Halo%20Admin%20SMS,%20saya%20sudah%20mendaftar%20atas%20nama%20${encodeURIComponent(name)}%20(${encodeURIComponent(category)})" style="display: inline-block; background-color: #ffc700; color: #1c1b1b; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Konfirmasi via WhatsApp Panitia
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #999077; text-align: center;">
                Fasilitas pilot: Pit Access, Frekuensi Slot, Tenda Camping, Official Jersey & Konsumsi 2 Hari.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #121414; padding: 20px; text-align: center; border-top: 1px solid #282a2b;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #ffc700;">
                SKY MULTIROTOR SQUAD (SMS) BANTEN HQ
              </p>
              <p style="margin: 0; font-size: 11px; color: #737373;">
                Ecopark Citra Garden BMW, Wanayasa, Kramatwatu, Serang, Banten 42161<br>
                Website: <a href="https://www.skymultirotor.web.id" style="color: #ffc700; text-decoration: none;">www.skymultirotor.web.id</a> | Instagram: @skymultirotor
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    // Kirim email ke Pilot
    const pilotMailOptions = {
      from: `"${fromName}" <${smtpUser}>`,
      to: email,
      subject: `Konfirmasi Registrasi Pilot: ${eventTitle} (${name})`,
      html: pilotHtml
    };

    const pilotInfo = await transporter.sendMail(pilotMailOptions);

    // 2. Kirim notifikasi ke Admin Panitia (jika adminEmail tersedia)
    if (adminEmail && adminEmail !== email) {
      const adminHtml = `
<div style="font-family: Arial, sans-serif; color: #222; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
  <h2 style="color: #c99700; margin-top: 0;">🚀 Pendaftaran Pilot Baru Diterima!</h2>
  <p>Ada pilot baru yang mendaftar untuk <strong>${eventTitle}</strong>:</p>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
    <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>Nama Pilot:</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;">${name}</td></tr>
    <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>Callsign / Komunitas:</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;">${callsign || 'Independen'}</td></tr>
    <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>WhatsApp:</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;"><a href="https://wa.me/${phone.replace(/\D/g, '')}">${phone}</a></td></tr>
    <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;">${email}</td></tr>
    <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>Kategori Drone:</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;">${category}</td></tr>
    <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>Metode Pembayaran:</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;">${paymentMethod}</td></tr>
    <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>Nominal:</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;">${fee}</td></tr>
  </table>
  <p style="font-size: 13px; color: #666;">Silakan periksa dashboard admin untuk verifikasi bukti transfer dan setujui slot pilot.</p>
</div>
`;

      try {
        await transporter.sendMail({
          from: `"${fromName}" <${smtpUser}>`,
          to: adminEmail,
          subject: `[Pendaftar Baru] ${name} - ${category} (${callsign || 'Pilot'})`,
          html: adminHtml
        });
      } catch (adminErr) {
        console.warn('Gagal mengirim tembusan ke admin:', adminErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      messageId: pilotInfo.messageId,
      message: 'Email konfirmasi pendaftaran berhasil dikirim ke pilot.'
    });

  } catch (error) {
    console.error('Error sending registration email via Hostinger SMTP:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Terjadi kesalahan saat mengirim email SMTP.'
    });
  }
}
