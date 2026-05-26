import { env } from "@/lib/env";
import { logger } from "@/utils/logger";

/**
 * Send a verification email using Brevo's HTTP API.
 * Falls back to console logging in development if no API key is set.
 */
export async function sendVerificationEmail({ email, name, token }) {
  const verifyUrl = `${env.APP_URL}/api/auth/verify?token=${token}`;
  
  const subject = "Verify your EduSaaS Account";
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #2563eb; margin-top: 0;">Welcome to EduSaaS!</h2>
      <p>Hi ${name || "there"},</p>
      <p>Thank you for signing up. Please click the button below to verify your email address and activate your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Account</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #4b5563;"><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p style="margin-bottom: 0;">This verification link will expire in 24 hours.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9ca3af;">If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;

  if (!env.BREVO_API_KEY) {
    logger.warn("BREVO_API_KEY not configured. Verification email printed to console:", { email, verifyUrl });
    console.log("=========================================");
    console.log(`VERIFICATION EMAIL FOR ${email}:`);
    console.log(`URL: ${verifyUrl}`);
    console.log("=========================================");
    return true;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "EduSaaS Support", email: env.FROM_EMAIL },
        to: [{ email, name }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error("Failed to send verification email via Brevo", { status: response.status, errorData });
      throw new Error(`Email sending failed with status ${response.status}`);
    }

    logger.info("Verification email sent via Brevo", { email });
    return true;
  } catch (error) {
    logger.error("Error in sendVerificationEmail:", error);
    throw error;
  }
}

/**
 * Send a contact reply email using Brevo's HTTP API.
 */
export async function sendContactReplyEmail({ email, name, subject, replyMessage }) {
  const emailSubject = `Re: ${subject}`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #2563eb; margin-top: 0;">EduSaaS Support Reply</h2>
      <p>Hi ${name},</p>
      <p>Thank you for contacting us. Here is the reply from our team:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 20px 0; white-space: pre-wrap; font-size: 0.95rem; color: #1f2937;">${replyMessage}</div>
      <p style="margin-top: 20px;">If you have any further questions, you can reply directly to this email.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9ca3af;">EduSaaS Bangladesh • Level 5, Rupayan Trade Centre, Dhaka</p>
    </div>
  `;

  if (!env.BREVO_API_KEY) {
    logger.warn("BREVO_API_KEY not configured. Contact reply email printed to console:", { email, subject, replyMessage });
    console.log("=========================================");
    console.log(`CONTACT REPLY EMAIL FOR ${email}:`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Message:\n${replyMessage}`);
    console.log("=========================================");
    return true;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "EduSaaS Support", email: env.FROM_EMAIL },
        to: [{ email, name }],
        subject: emailSubject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error("Failed to send contact reply email via Brevo", { status: response.status, errorData });
      throw new Error(`Email sending failed with status ${response.status}`);
    }

    logger.info("Contact reply email sent via Brevo", { email });
    return true;
  } catch (error) {
    logger.error("Error in sendContactReplyEmail:", error);
    throw error;
  }
}
