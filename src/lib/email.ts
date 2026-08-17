import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY || "";
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// Initialize Resend. Log a warning rather than throwing to prevent startup crashes.
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendOTPEmail(toEmail: string, otp: string): Promise<boolean> {
  if (!resend) {
    console.warn(
      `[EMAIL NOTIFICATION] RESEND_API_KEY is missing in your environment! Email to ${toEmail} could not be sent. OTP Code: ${otp}`
    );
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Pyur Ayur Herbs Store <${fromEmail}>`,
      to: toEmail,
      subject: "Your OTP Verification Code - Pyur Ayur Herbs",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddddd9; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #244f31; text-align: center; text-transform: uppercase; margin-bottom: 5px;">Pyur Ayur Herbs</h2>
          <p style="text-align: center; font-size: 11px; color: #666666; margin-top: 0; margin-bottom: 20px;">100% Certified Ministry of AYUSH Wellness</p>
          <hr style="border: 0; border-top: 1px solid #ddddd9; margin: 20px 0;" />
          <p>Hello,</p>
          <p>We received a request to reset your password. Please use the following 6-digit verification code (OTP) to complete the process:</p>
          <div style="text-align: center; padding: 15px; margin: 20px 0; background-color: #f8faf1; border-radius: 8px; border: 1px dashed #244f31;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #244f31; font-family: monospace;">${otp}</span>
          </div>
          <p style="font-size: 11px; color: #666666;">This code is valid for 10 minutes. If you did not make this request, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #ddddd9; margin: 20px 0;" />
          <p style="font-size: 10px; text-align: center; color: #999999;">© ${new Date().getFullYear()} Pyur Ayur Herbs Store. India.</p>
        </div>
      `,
    });

    if (error) {
      console.error("[EMAIL NOTIFICATION] Resend SDK returned an error:", error);
      return false;
    }

    console.log(`[EMAIL NOTIFICATION] OTP Email sent successfully to ${toEmail}. Message ID: ${data?.id}`);
    return true;
  } catch (error) {
    console.error("[EMAIL NOTIFICATION] Error sending OTP email via Resend:", error);
    return false;
  }
}

