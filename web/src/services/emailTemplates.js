/**
 * KusinApp Transactional Email Templates
 * Styled strictly after the KusinApp Brand System and culinary color palette:
 * - Warm cream background (#faf7f0 / #f7f4ee)
 * - Primary Golden Amber: #f59e0b / #d97706
 * - Chili Red Accent: #d92d20 / #b42318
 * - Ink text: #101828 (primary) & #475467 (secondary)
 * - Bulletproof HTML table layout tested for Gmail, Apple Mail, and Outlook.
 */

/**
 * Generates the "Welcome to KusinApp" branded HTML email notification.
 */
export function getWelcomeEmailHtml({ displayName = "Chef" }) {
  const firstName = displayName.split(" ")[0] || "Chef";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to KusinApp</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf7f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #101828;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #faf7f0; padding: 36px 14px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 8px 30px rgba(16, 24, 40, 0.08); overflow: hidden; border: 1px solid #e4e7ec;">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 32px 32px 20px;">
              <div style="font-size: 32px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.2;">
                <span style="color: #f59e0b;">Kusin</span><span style="color: #d92d20;">App</span>
              </div>
              <div style="font-size: 12px; font-weight: 700; color: #667085; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;">
                Smart Filipino Meal Planning & Pantry System
              </div>
            </td>
          </tr>

          <!-- Hero Greeting -->
          <tr>
            <td align="center" style="padding: 0 32px 20px;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #101828; letter-spacing: -0.02em;">
                Welcome to KusinApp!
              </h1>
            </td>
          </tr>

          <!-- Gradient Card Banner -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #d92d20 100%); border-radius: 16px; padding: 28px 24px; text-align: center; color: #ffffff;">
                <div style="font-size: 20px; font-weight: 800; line-height: 1.35; margin-bottom: 8px;">
                  Lasang Pinoy sa Bawat Luto — Sustansya at Badyet
                </div>
                <div style="font-size: 13.5px; opacity: 0.95; line-height: 1.55; max-width: 440px; margin: 0 auto;">
                  Personalized Filipino meal suggestions, balanced local nutrition, and smart pantry management designed for your household.
                </div>
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 0 32px 32px; font-size: 15px; line-height: 1.6; color: #344054;">
              <p style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #101828;">
                Mabuhay, ${firstName}!
              </p>
              <p style="margin: 0 0 16px;">
                Your KusinApp account is officially ready. Whether you're cooking for yourself or planning family meals for the week, KusinApp helps you balance flavor, nutrition, and market costs.
              </p>

              <!-- Feature Highlights -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #eaecf0; border-radius: 12px; padding: 16px 20px;">
                <tr>
                  <td style="padding: 8px 0; vertical-align: top; width: 22px; color: #f59e0b; font-size: 16px; font-weight: bold;">•</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #344054;">
                    <strong style="color: #101828;">Health-Tailored Recipes:</strong> Customized Filipino dishes aligned with your BMI, BMR, and dietary goals.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; vertical-align: top; width: 22px; color: #f59e0b; font-size: 16px; font-weight: bold;">•</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #344054;">
                    <strong style="color: #101828;">Dietary Restrictions:</strong> Automated ingredient alerts for hypertension (low sodium), diabetes, allergies, and acid reflux.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; vertical-align: top; width: 22px; color: #f59e0b; font-size: 16px; font-weight: bold;">•</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #344054;">
                    <strong style="color: #101828;">Pantry & Budget Tracker:</strong> Log in-stock ingredients to eliminate food waste and estimate grocery bills.
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px; font-size: 14px; color: #475467;">
                Ready to begin? Complete your quick 5-step health assessment on your dashboard to unlock custom calorie suggestions.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #eaecf0; padding: 22px 32px; text-align: center; font-size: 12px; color: #667085; line-height: 1.5;">
              <p style="margin: 0 0 6px; font-weight: 600; color: #344054;">
                © 2026 KusinApp · Lasang Pinoy sa Bawat Luto.
              </p>
              <p style="margin: 0;">
                You received this confirmation email because you registered on KusinApp.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates the 6-Digit OTP Password Reset Verification email.
 */
export function getOtpEmailHtml({ email, otpCode }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code - KusinApp</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf7f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #101828;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #faf7f0; padding: 36px 14px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 8px 30px rgba(16, 24, 40, 0.08); overflow: hidden; border: 1px solid #e4e7ec;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 32px 32px 18px;">
              <div style="font-size: 30px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.2;">
                <span style="color: #f59e0b;">Kusin</span><span style="color: #d92d20;">App</span>
              </div>
              <div style="font-size: 12px; font-weight: 700; color: #667085; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;">
                Security & Account Recovery
              </div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding: 0 32px 16px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #101828; letter-spacing: -0.02em;">
                Password Reset Verification Code
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #475467; line-height: 1.5;">
                We received a request to reset your password for:
                <br /><strong style="color: #101828;">${email}</strong>
              </p>
            </td>
          </tr>

          <!-- OTP Display Box -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #fffbeb; border: 2px dashed #f59e0b; border-radius: 16px; padding: 26px 20px; text-align: center;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #b45309; margin-bottom: 10px;">
                  Your 6-Digit One-Time Code
                </div>
                <div style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #b45309; font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace; padding-left: 12px;">
                  ${otpCode}
                </div>
                <div style="display: inline-block; margin-top: 10px; font-size: 12px; font-weight: 600; color: #d97706; background-color: #fef3c7; padding: 4px 12px; border-radius: 999px;">
                  ⏱ Valid for 10 minutes only
                </div>
              </div>
            </td>
          </tr>

          <!-- Security Instructions -->
          <tr>
            <td style="padding: 0 32px 28px; font-size: 14px; line-height: 1.6; color: #475467;">
              <p style="margin: 0 0 12px;">
                Enter this code on the KusinApp password recovery screen to set your new password.
              </p>
              <div style="background-color: #f8fafc; border-left: 3px solid #f59e0b; padding: 10px 14px; border-radius: 4px; font-size: 13px; color: #667085;">
                <strong>Security tip:</strong> KusinApp staff will never ask for your verification code. If you did not initiate this request, you can safely ignore this email — your password remains secure.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #eaecf0; padding: 20px 32px; text-align: center; font-size: 12px; color: #667085; line-height: 1.5;">
              <p style="margin: 0 0 4px; font-weight: 600; color: #344054;">
                © 2026 KusinApp · Account Security Team
              </p>
              <p style="margin: 0;">
                Automated security notification. Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
