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
      name = 'Pilot Speelwijk',
      callsign = '',
      community = 'Independen',
      phone = '-',
      email,
      category = 'Cinematic FPV',
      regCode = 'REG-SPW-2026',
      eventTitle = 'Fly Through History – Benteng Speelwijk Drone Fest 2026',
      eventDate = 'Sabtu – Minggu, 17 – 18 Oktober 2026',
      eventLocation = 'Situs Cagar Budaya Benteng Speelwijk, Kampung Pamarican, Kasemen, Banten Lama, Kota Serang',
      mapsUrl = 'https://maps.app.goo.gl/Speelwijk'
    } = req.body || {};

    if (!email || email === '-' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Alamat email pilot tidak valid atau belum diisi.'
      });
    }

    const smtpHost = process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com';
    const smtpPort = Number(process.env.HOSTINGER_SMTP_PORT) || 465;
    const smtpSecure = process.env.HOSTINGER_SMTP_SECURE === 'false' ? false : true;
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

    const validationUrl = `https://www.skymultirotor.web.id/benteng-speelwijk-validasi?code=${encodeURIComponent(regCode)}`;
    const pilotDisplayCallsign = callsign ? `(${callsign})` : '';

    const approvalHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>[TIKET RESMI] Slot Anda Telah Dikonfirmasi! – ${eventTitle}</title>
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
              <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 18px; font-weight: 700;">
                Halo Pilot <span style="color: #ffc700;">${name}</span> ${pilotDisplayCallsign}, 🛸⚡
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #c8c6c5;">
                Kabar gembira! Pembayaran dan data pendaftaran Anda untuk ajang:<br>
                <strong style="color: #ffffff;">"${eventTitle}"</strong><br>
                telah <strong style="color: #34d399;">BERHASIL DIVERIFIKASI & DISETUJUI</strong> oleh tim panitia Sky Multirotor Squad.
              </p>
              <p style="margin: 0 0 25px 0; font-size: 14px; line-height: 1.6; color: #ffc700; font-weight: 700;">
                Slot terbang resmi Anda kini telah TERKUNCI (SECURED).
              </p>

              <!-- E-Ticket Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #282a2b; border-radius: 8px; border: 1px solid #474746; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 11px; font-weight: 700; color: #ffc700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #3d3f40; padding-bottom: 6px;">
                      🎫 E-TICKET &amp; DETAIL SLOT RESMI PILOT
                    </div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="5" style="font-size: 13px;">
                      <tr>
                        <td width="38%" style="color: #999077;">No. Registrasi:</td>
                        <td style="color: #ffc700; font-family: monospace; font-weight: 800; font-size: 14px;">${regCode}</td>
                      </tr>
                      <tr>
                        <td style="color: #999077;">Nama Lengkap:</td>
                        <td style="color: #ffffff; font-weight: 600;">${name}</td>
                      </tr>
                      <tr>
                        <td style="color: #999077;">Callsign / Tim:</td>
                        <td style="color: #ffffff; font-weight: 600;">${callsign || '-'} / ${community || 'Independen'}</td>
                      </tr>
                      <tr>
                        <td style="color: #999077;">Kategori Race:</td>
                        <td style="color: #ffffff; font-weight: 600;">${category}</td>
                      </tr>
                      <tr>
                        <td style="color: #999077;">Status Slot:</td>
                        <td>
                          <span style="display: inline-block; background-color: rgba(52, 211, 153, 0.2); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.4); padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">
                            ✅ VALID &amp; LUNAS (TERVERIFIKASI)
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Benefits Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #202223; border-radius: 8px; border: 1px solid #3d3f40; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 11px; font-weight: 700; color: #ffc700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px;">
                      🎁 FASILITAS &amp; BENEFIT SLOT ANDA TERMASUK:
                    </div>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #e2e2e2;">
                      <li>Pit Access Eksklusif &amp; Slot Frekuensi Terdedikasi</li>
                      <li>Tenda Camping Ground di Area Cagar Budaya Benteng Speelwijk</li>
                      <li>Konsumsi Lengkap &amp; Free-flow Air Minum selama 2 Hari Event</li>
                      <li>Medali / Sertifikat Resmi Partisipasi Pilot Speelwijk 2026</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Schedule & Location Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #181a1a; border-radius: 8px; border-left: 4px solid #ffc700; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 15px 18px;">
                    <p style="margin: 0; font-size: 12px; color: #ffc700; font-weight: 700; text-transform: uppercase;">
                      📅 JADWAL &amp; LOKASI KEGIATAN:
                    </p>
                    <p style="margin: 6px 0 4px 0; font-size: 13px; color: #ffffff;">
                      <strong>${eventDate}</strong> (08:00 WIB s/d Selesai)<br>
                      <span style="font-size: 12px; color: #c8c6c5;">• Day 1 (17 Okt): Registrasi Ulang, Practice, Kualifikasi &amp; Eksibisi</span><br>
                      <span style="font-size: 12px; color: #c8c6c5;">• Day 2 (18 Okt): Babak Eliminasi, Semifinal, Grand Final &amp; Awarding</span>
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #ffffff;">
                      📍 <strong>${eventLocation}</strong><br>
                      <a href="${mapsUrl}" target="_blank" style="color: #ffc700; font-size: 12px; text-decoration: underline;">Buka Google Maps Lokasi</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Check-in Instructions -->
              <div style="background-color: #181a1a; border-radius: 8px; border: 1px solid #333535; padding: 18px 20px; margin-bottom: 25px;">
                <div style="font-size: 11px; font-weight: 700; color: #ffc700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px;">
                  📲 INSTRUKSI SAAT TIBA DI VENUE (CHECK-IN):
                </div>
                <ol style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.7; color: #c8c6c5;">
                  <li>Saat tiba di lokasi, silakan menuju ke <strong>MEJA REGISTRASI RESMI</strong>.</li>
                  <li>Anda cukup scan QR Code Check-in di meja booth atau tunjukkan Nomor Registrasi Anda: <strong style="color: #ffc700;">${regCode}</strong>.</li>
                  <li>Anda juga dapat langsung membuka kartu identitas digital Anda melalui tautan di bawah.</li>
                  <li>Petugas di meja registrasi akan menyerahkan Race Tag, Pit Pass, dan ID Card Anda.</li>
                </ol>
              </div>

              <!-- CTA Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
                <tr>
                  <td align="center">
                    <a href="${validationUrl}" target="_blank" style="display: inline-block; background-color: #ffc700; color: #1c1b1b; text-decoration: none; font-weight: 800; font-size: 13px; padding: 14px 32px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(255, 199, 0, 0.3);">
                      Buka E-Ticket &amp; Validasi QR
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <a href="https://wa.me/6287772272928?text=Halo%20Admin%20SMS,%20saya%20pilot%20${encodeURIComponent(name)}%20(${encodeURIComponent(regCode)}),%20ingin%20konfirmasi%20tiket%20Speelwijk" target="_blank" style="color: #34d399; text-decoration: none; font-size: 12px; font-weight: 600;">
                      💬 Butuh bantuan teknis? Hubungi WhatsApp Hotline Panitia
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 10px 0; font-size: 13px; line-height: 1.6; color: #c8c6c5; text-align: center; font-style: italic;">
                Persiapkan quad Anda, calibrate gear, and see you on the track!
              </p>
              <p style="margin: 0; font-size: 12px; color: #999077; text-align: center;">
                Salam satu udara,<br>
                <strong style="color: #ffc700;">Panitia Pelaksana Benteng Speelwijk Drone Fest 2026</strong><br>
                Sky Multirotor Squad (SMS) Banten
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
      subject: `[TIKET RESMI] Slot Anda Telah Dikonfirmasi! – ${eventTitle}`,
      html: approvalHtml
    };

    const pilotInfo = await transporter.sendMail(pilotMailOptions);

    // Kirim tembusan info ke Admin jika berbeda
    if (adminEmail && adminEmail !== email) {
      try {
        await transporter.sendMail({
          from: `"${fromName}" <${smtpUser}>`,
          to: adminEmail,
          subject: `[E-TICKET TERKIRIM] ${name} (${callsign || 'Pilot'}) - ${regCode}`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #222; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h3 style="color: #34d399; margin-top: 0;">✅ E-Ticket Resmi Berhasil Dikirim ke Pilot</h3>
              <p>Panitia baru saja mengirimkan tiket approval resmi untuk:</p>
              <p><strong>Nama:</strong> ${name}<br><strong>Callsign:</strong> ${callsign || '-'}<br><strong>No. Registrasi:</strong> ${regCode}<br><strong>Email Tujuan:</strong> ${email}<br><strong>Kategori:</strong> ${category}</p>
            </div>
          `
        });
      } catch (adminErr) {
        console.warn('Gagal kirim tembusan admin:', adminErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      messageId: pilotInfo.messageId,
      message: `Email konfirmasi approval & e-ticket resmi berhasil dikirim ke ${email}.`
    });

  } catch (error) {
    console.error('Error sending approval email via Hostinger SMTP:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Terjadi kesalahan saat mengirim email approval SMTP.'
    });
  }
}
