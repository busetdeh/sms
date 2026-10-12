/**
 * Standalone Local CLI Test Script for Hostinger SMTP
 * Jalankan: node scripts/test-smtp.js [email-tujuan@example.com]
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Baca .env jika ada
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      const val = vals.join('=').replace(/^["']|["']$/g, '');
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val.trim();
      }
    }
  });
}

const smtpHost = process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com';
const smtpPort = Number(process.env.HOSTINGER_SMTP_PORT) || 465;
const smtpSecure = process.env.HOSTINGER_SMTP_SECURE !== 'false';
const smtpUser = process.env.HOSTINGER_SMTP_USER;
const smtpPass = process.env.HOSTINGER_SMTP_PASS;
const fromName = process.env.HOSTINGER_SMTP_FROM_NAME || 'Sky Multirotor Squad';
const targetEmail = process.argv[2] || process.env.ADMIN_NOTIFICATION_EMAIL || smtpUser;

console.log('----------------------------------------------------');
console.log('🚀 PENGUJIAN HOSTINGER SMTP - SKY MULTIROTOR SQUAD');
console.log('----------------------------------------------------');
console.log('Host:     ', smtpHost);
console.log('Port:     ', smtpPort, `(Secure: ${smtpSecure ? 'SSL' : 'TLS'})`);
console.log('Username: ', smtpUser || '⚠️ [BELUM DISET DI .ENV]');
console.log('Password: ', smtpPass ? '******** (Sudah diisi)' : '⚠️ [BELUM DISET DI .ENV]');
console.log('Penerima: ', targetEmail || '⚠️ [TIDAK ADA EMAIL TUJUAN]');
console.log('----------------------------------------------------\n');

if (!smtpUser || !smtpPass) {
  console.error('❌ Gagal: HOSTINGER_SMTP_USER dan HOSTINGER_SMTP_PASS harus diisi di file .env atau environment variables.');
  process.exit(1);
}

if (!targetEmail) {
  console.error('❌ Gagal: Masukkan email tujuan test, contoh:\n   node scripts/test-smtp.js emailanda@gmail.com');
  process.exit(1);
}

async function runTest() {
  console.log('📡 1. Menghubungi server Hostinger SMTP...');
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

  try {
    await transporter.verify();
    console.log('✅ Koneksi & Otentikasi SMTP Berhasil!\n');

    console.log(`✉️ 2. Mengirim email uji coba ke: ${targetEmail}...`);
    const info = await transporter.sendMail({
      from: `"${fromName}" <${smtpUser}>`,
      to: targetEmail,
      subject: `[TEST] Hostinger SMTP - Sky Multirotor Squad (${new Date().toLocaleTimeString('id-ID')})`,
      text: `Halo,\n\nIni adalah email uji coba dari Sky Multirotor Squad untuk memastikan konfigurasi Hostinger SMTP berfungsi normal.\n\nHost: ${smtpHost}:${smtpPort}\nSender: ${smtpUser}\nWaktu: ${new Date().toISOString()}`
    });

    console.log('🎉 EMAIL BERHASIL TERKIRIM!');
    console.log('Message ID: ', info.messageId);
    console.log('Response:   ', info.response);
    console.log('\nSilakan periksa kotak masuk (atau folder spam/junk) di:', targetEmail);
  } catch (error) {
    console.error('\n❌ Pengujian Gagal:');
    console.error(error.message);
    if (error.code) console.error('Kode Error:', error.code);
    if (error.response) console.error('Response Server:', error.response);
  }
}

runTest();
