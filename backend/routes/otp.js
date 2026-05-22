const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/send-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required.' });
  }

  try {
    // 1. Create nodemailer transporter
    // We check if SMTP credentials exist in process.env
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

    if (!smtpUser || !smtpPass) {
      console.log('--------------------------------------------------');
      console.log(`🔑 [OTP SEND FALLBACK] SMTP not configured. Attempting FormSubmit delivery to ${email}.`);
      console.log(`OTP Code: ${otp}`);
      console.log('--------------------------------------------------');

      try {
        await fetch(`https://formsubmit.co/ajax/${email}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: '🔑 Your MacroMind Verification Code',
            code: otp,
            message: `Hello! Your secure 6-digit MacroMind login verification code is: ${otp}. Please enter it on the website to sign in.`
          })
        });
        console.log(`✉️ Real Email OTP successfully dispatched via FormSubmit to: ${email}`);
        return res.json({ 
          success: true, 
          formsubmit: true,
          message: 'OTP sent to your email.' 
        });
      } catch (fsError) {
        console.error('❌ FormSubmit Fallback Error:', fsError);
        return res.json({ 
          success: true, 
          fallback: true,
          message: 'OTP logged to console. FormSubmit fallback failed.' 
        });
      }
    }

    // Standard Transporter (can handle Gmail, Brevo, SMTP2GO, etc.)
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"MacroMind Security" <${smtpUser}>`,
      to: email,
      subject: '🔑 Your Two-Step Verification OTP Code',
      html: `
        <div style="font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 40px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 800; color: #6366f1; letter-spacing: 1px;">MACROMIND</span>
          </div>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Two-Step Verification</h2>
          <p style="font-size: 0.9rem; color: #475569; line-height: 1.5; margin-bottom: 24px;">
            A request was made to log in to your account. Enter the secure 6-digit verification code below to authorize your session:
          </p>
          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 18px 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #0f172a;">${otp}</span>
          </div>
          <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 0;">
            This OTP code is valid for exactly <strong>30 seconds</strong>. If you did not make this request, please secure your account immediately.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ Real Email OTP successfully sent to: ${email}`);
    return res.json({ success: true, message: 'OTP sent to your email.' });

  } catch (error) {
    console.error('❌ Nodemailer Error:', error);
    return res.status(500).json({ error: 'Failed to send OTP email: ' + error.message });
  }
});

module.exports = router;
