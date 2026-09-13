import { Resend } from "resend";
import nodemailer from "nodemailer";
import { readDB } from "@/lib/db";

const resendApiKey = process.env.RESEND_API_KEY || "";
const resendFromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendOTPEmail(toEmail: string, otp: string): Promise<boolean> {
  // 1. Try Resend API if key is present
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: `Pure Ayur Herbs <${resendFromEmail}>`,
        to: toEmail,
        subject: "Your OTP Verification Code - Pure Ayur Herbs",
        html: getOTPEmailTemplate(otp),
      });

      if (!error && data?.id) {
        console.log(`[EMAIL OTP] Sent via Resend to ${toEmail}. Message ID: ${data.id}`);
        return true;
      }
    } catch (err) {
      console.error("[EMAIL OTP] Resend error, attempting SMTP fallback:", err);
    }
  }

  // 2. Try Nodemailer / SMTP (Gmail or custom SMTP from env or db.settings)
  try {
    const db = await readDB();
    const emailSettings = db.settings?.email || {};

    const smtpHost = process.env.SMTP_HOST || emailSettings.smtpHost;
    const smtpPort = parseInt(process.env.SMTP_PORT || String(emailSettings.smtpPort || 587));
    const smtpUser = process.env.SMTP_USER || emailSettings.smtpUser;
    const smtpPass = process.env.SMTP_PASS || emailSettings.smtpPass;

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"${emailSettings.senderName || "Pure Ayur Herbs"}" <${smtpUser}>`,
        to: toEmail,
        subject: "Your Verification Code - Pure Ayur Herbs",
        html: getOTPEmailTemplate(otp),
      });

      console.log(`[EMAIL OTP] Sent via Nodemailer SMTP to ${toEmail}`);
      return true;
    }
  } catch (smtpErr) {
    console.error("[EMAIL OTP] SMTP Error:", smtpErr);
  }

  console.warn(`[EMAIL OTP] Neither RESEND_API_KEY nor SMTP credentials configured. OTP for ${toEmail}: ${otp}`);
  return false;
}

function getOTPEmailTemplate(otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #ddddd9; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #244f31; text-align: center; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">Pure Ayur Herbs</h2>
      <p style="text-align: center; font-size: 11px; color: #666666; margin-top: 0; margin-bottom: 20px;">100% Certified Ministry of AYUSH Wellness</p>
      <hr style="border: 0; border-top: 1px solid #ddddd9; margin: 20px 0;" />
      <p style="font-size: 14px; color: #17231b;">Hello,</p>
      <p style="font-size: 14px; color: #17231b;">To complete your order verification with <strong>Pure Ayur Herbs</strong>, please enter the 4-digit verification code below:</p>
      <div style="text-align: center; padding: 20px; margin: 24px 0; background-color: #f8faf1; border-radius: 12px; border: 1px dashed #244f31;">
        <span style="font-size: 38px; font-weight: bold; letter-spacing: 8px; color: #244f31; font-family: monospace;">${otp}</span>
      </div>
      <p style="font-size: 12px; color: #666666;">This verification code is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
      <hr style="border: 0; border-top: 1px solid #ddddd9; margin: 20px 0;" />
      <p style="font-size: 11px; text-align: center; color: #999999;">© ${new Date().getFullYear()} Pure Ayur Herbs Private Limited. India.</p>
    </div>
  `;
}
