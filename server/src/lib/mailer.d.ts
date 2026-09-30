import nodemailer from "nodemailer";
/**
 * Creates a Nodemailer transporter configured for Mailtrap (or Gmail fallback).
 */
export declare function createTransporter(): nodemailer.Transporter<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo, import("nodemailer/lib/smtp-transport/index.js").Options>;
/**
 * Sends a stylized HTML OTP verification email.
 */
export declare function sendOtpEmail({ to, otp, subject, title, description, }: {
    to: string;
    otp: string;
    subject: string;
    title: string;
    description: string;
}): Promise<void>;
//# sourceMappingURL=mailer.d.ts.map