import { getWelcomeEmailHtml, getOtpEmailHtml } from "./emailTemplates";

/**
 * KusinApp Transactional Email Dispatcher Service
 * Dispatches branded HTML emails for Welcome Registration and OTP Verification.
 * Supports:
 * 1. Resend API (VITE_RESEND_API_KEY in .env)
 * 2. EmailJS REST API (VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY)
 * 3. Browser Console DevTools logger with formatted preview
 */

/**
 * Sends a Welcome to KusinApp email to a newly registered user.
 */
export async function sendWelcomeEmail(email, displayName = "Chef") {
  const html = getWelcomeEmailHtml({ displayName });
  const subject = "Welcome to KusinApp!";

  console.log(`[KusinApp Email Service] Sending Welcome Email to: ${email}`);

  // 1. Resend API (https://resend.com)
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
          from: "KusinApp <onboarding@resend.dev>",
          to: [email],
          subject,
          html,
        }),
      });
      console.log(`[KusinApp Email Service] Welcome email successfully dispatched via Resend to ${email}`);
      return { success: true };
    } catch (err) {
      console.warn("[KusinApp Email Service] Resend API dispatch error:", err);
    }
  }

  // 2. EmailJS REST API (https://www.emailjs.com)
  const emailjsServiceId = import.meta.env?.VITE_EMAILJS_SERVICE_ID;
  const emailjsTemplateId = import.meta.env?.VITE_EMAILJS_WELCOME_TEMPLATE_ID || import.meta.env?.VITE_EMAILJS_TEMPLATE_ID;
  const emailjsPublicKey = import.meta.env?.VITE_EMAILJS_PUBLIC_KEY;
  if (emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
    try {
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: emailjsServiceId,
          template_id: emailjsTemplateId,
          user_id: emailjsPublicKey,
          template_params: {
            to_email: email,
            to_name: displayName,
            subject,
            message_html: html,
          },
        }),
      });
      console.log(`[KusinApp Email Service] Welcome email dispatched via EmailJS to ${email}`);
      return { success: true };
    } catch (err) {
      console.warn("[KusinApp Email Service] EmailJS dispatch error:", err);
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

  // 1. Resend API (https://resend.com)
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
          from: "KusinApp Security <onboarding@resend.dev>",
          to: [email],
          subject,
          html,
        }),
      });
      console.log(`[KusinApp Email Service] OTP email successfully dispatched via Resend to ${email}`);
      return { success: true };
    } catch (err) {
      console.warn("[KusinApp Email Service] Resend API dispatch error:", err);
    }
  }

  // 2. EmailJS REST API (https://www.emailjs.com)
  const emailjsServiceId = import.meta.env?.VITE_EMAILJS_SERVICE_ID;
  const emailjsTemplateId = import.meta.env?.VITE_EMAILJS_OTP_TEMPLATE_ID || import.meta.env?.VITE_EMAILJS_TEMPLATE_ID;
  const emailjsPublicKey = import.meta.env?.VITE_EMAILJS_PUBLIC_KEY;
  if (emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
    try {
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: emailjsServiceId,
          template_id: emailjsTemplateId,
          user_id: emailjsPublicKey,
          template_params: {
            to_email: email,
            otp_code: otpCode,
            subject,
            message_html: html,
          },
        }),
      });
      console.log(`[KusinApp Email Service] OTP email dispatched via EmailJS to ${email}`);
      return { success: true };
    } catch (err) {
      console.warn("[KusinApp Email Service] EmailJS dispatch error:", err);
    }
  }

  return { success: true, previewHtml: html };
}
