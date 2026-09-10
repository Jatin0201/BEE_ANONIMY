import nodemailer from "nodemailer";

/**
 * Creates a Nodemailer transporter configured for Mailtrap (or Gmail fallback).
 */
export function createTransporter() {
  const host = process.env.EMAIL_HOST;

  if (host) {
    return nodemailer.createTransport({
      host,
      port: Number(process.env.EMAIL_PORT) || 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Sends a stylized HTML OTP verification email.
 */
export async function sendOtpEmail({
  to,
  otp,
  subject,
  title,
  description,
}: {
  to: string;
  otp: string;
  subject: string;
  title: string;
  description: string;
}) {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM ?? process.env.EMAIL_USER ?? "Anonimy <noreply@anonimy.dev>";

  await transporter.sendMail({
    from,
    to,
    subject,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#FAF7F4;border-radius:12px;">
        <p style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#6B6359;margin:0 0 24px;font-weight:600;">ANONIMY</p>
        <h2 style="font-size:24px;font-weight:400;color:#1A1A1A;margin:0 0 12px;">${title}</h2>
        <p style="font-size:14px;color:#6B6359;line-height:1.6;margin:0 0 28px;">
          ${description}
        </p>
        <div style="background:#FFFFFF;border:1px solid #E8E2DB;border-radius:10px;padding:20px 28px;text-align:center;letter-spacing:0.35em;font-size:34px;font-weight:600;color:#1A1A1A;font-family:monospace;">
          ${otp}
        </div>
        <p style="font-size:12px;color:#9E9187;margin:24px 0 0;line-height:1.6;">
          If you didn't request this, you can safely ignore this email.<br/>
          This code expires in 10 minutes.
        </p>
      </div>
    `,
    text: `${title}\n\n${description}\n\nYour code is: ${otp}\n\nThis code expires in 10 minutes.`,
  });
}
