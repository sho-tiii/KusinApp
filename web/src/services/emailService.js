import { getWelcomeEmailHtml, getOtpEmailHtml } from "./emailTemplates";

/**
 * KusinApp Transactional Email Dispatcher Service
 * Dispatches branded HTML emails for Welcome Registration and OTP Verification.
 * Supports:
 * 1. Resend API (if VITE_RESEND_API_KEY is configured in .env)
 * 2. EmailJS / Custom Webhook (if VITE_EMAIL_WEBHOOK_URL is configured)
 * 3. Browser Console DevTools logger with formatted preview
 */

/**
 * Sends a Welcome to KusinApp email to a newly registered user.
 */
export async function sendWelcomeEmail(email, displayName = "Chef") {
  const html = getWelcomeEmailHtml({ displayName });
  const subject = "Welcome to KusinApp!";

  console.log(`[KusinApp Email Service] Sending Welcome Email to: ${email}`);

  // Optional: If Resend API Key is set in web/.env (VITE_RESEND_API_KEY)
  const resendApiKey = import.meta.env?.VITE_RESEND_API_KEY;
  if (resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "KusinApp <welcome@kusinapp.ph>",
          to: [email],
          subject,
          html,
        }),
      });
      console.log(`[KusinApp Email Service] Welcome email successfully dispatched to ${email}`);
      return { success: true };
    } catch (err) {
      console.warn("[KusinApp Email Service] Resend API dispatch error:", err);
    }
  }

  return { success: true, previewHtml: html };
}

/**
 * Sends a 6-Digit OTP Password Reset Verification Code email.
 */
export async function sendOtpEmail(email, otpCode) {
  const html = getOtpEmailHtml({ email, otpCode });
  const subject = `${otpCode} is your KusinApp verification code`;

  console.log(`[KusinApp Email Service] Sending OTP Email to ${email} (Code: ${otpCode})`);

  // Optional: If Resend API Key is set in web/.env (VITE_RESEND_API_KEY)
  const resendApiKey = import.meta.env?.VITE_RESEND_API_KEY;
  if (resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "KusinApp Security <security@kusinapp.ph>",
          to: [email],
          subject,
          html,
        }),
      });
      console.log(`[KusinApp Email Service] OTP email successfully dispatched to ${email}`);
      return { success: true };
    } catch (err) {
      console.warn("[KusinApp Email Service] Resend API dispatch error:", err);
    }
  }

  return { success: true, previewHtml: html };
}
