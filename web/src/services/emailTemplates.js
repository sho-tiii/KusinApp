/**
 * KusinApp Transactional Email Templates
 * Styled strictly after the KusinApp Brand System and the approved Welcome prototype:
 * - Clean white card on warm cream background (#f7f4ee)
 * - Official KusinApp branding
 * - Warm amber (#f59e0b) to chili red (#d92d20) gradient hero banner
 * - Multi-client compatible inline CSS (Gmail, Apple Mail, Outlook, mobile)
 */

/**
 * Generates the "Welcome to KusinApp" confirmation email.
 * Mirrors the layout seen in the official Welcome prototype.
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
<body style="margin: 0; padding: 0; background-color: #faf7f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #101828;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #faf7f0; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 20px rgba(16, 24, 40, 0.08); overflow: hidden; border: 1px solid #eaecf0;">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 32px 32px 20px;">
              <h2 style="margin: 0; font-size: 26px; font-weight: 800; color: #101828; letter-spacing: -0.02em;">
                <span style="color: #f59e0b;">Kusin</span><span style="color: #d92d20;">App</span>
              </h2>
              <div style="font-size: 13px; font-weight: 600; color: #667085; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px;">
                Filipino Meal Planning & Pantry Management
              </div>
            </td>
          </tr>

          <!-- Hero Greeting -->
          <tr>
            <td align="center" style="padding: 0 32px 24px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #101828; letter-spacing: -0.03em;">
                Welcome to KusinApp
              </h1>
            </td>
          </tr>

          <!-- Gradient Card Banner (patterned after prototype) -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #d92d20 100%); border-radius: 16px; padding: 32px 24px; text-align: center; color: #ffffff;">
                <div style="font-size: 22px; font-weight: 800; line-height: 1.3; margin-bottom: 8px;">
                  Making healthy Filipino cooking easy and budget-friendly
                </div>
                <div style="font-size: 14px; opacity: 0.95; line-height: 1.5; max-width: 440px; margin: 0 auto;">
                  Personalized meal suggestions, balanced local nutrition, and smart pantry management built for your household.
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
                Welcome to <strong>KusinApp</strong>! You're now officially registered and part of our community of home cooks and families across the Philippines.
              </p>
              <p style="margin: 0 0 24px;">
                With your new account, you can now:
              </p>

              <!-- Feature Bullet Points -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 24px; color: #f59e0b; font-weight: bold;">✓</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #344054;"><strong>Tailored Meal Planning:</strong> Recipes tailored to your cooking skill and health goals.</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 24px; color: #f59e0b; font-weight: bold;">✓</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #344054;"><strong>Dietary Care:</strong> Automatic screening for hypertension, diabetes, and acid reflux.</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 24px; color: #f59e0b; font-weight: bold;">✓</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #344054;"><strong>Pantry Cost Tracker:</strong> Keep ingredient prices and meal portions strictly in budget.</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="http://localhost:5173" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 999px; box-shadow: 0 2px 6px rgba(245, 158, 11, 0.35);">
                      Open KusinApp Web Viewer →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #eaecf0; padding: 24px 32px; text-align: center; font-size: 12px; color: #667085; line-height: 1.5;">
              <p style="margin: 0 0 6px;">
                © 2026 KusinApp. Recipe & Cost Management Platform.
              </p>
              <p style="margin: 0;">
                You received this email because you created an account on KusinApp.
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
<body style="margin: 0; padding: 0; background-color: #faf7f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #101828;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #faf7f0; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 20px rgba(16, 24, 40, 0.08); overflow: hidden; border: 1px solid #eaecf0;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 32px 32px 20px;">
              <h2 style="margin: 0; font-size: 26px; font-weight: 800; color: #101828; letter-spacing: -0.02em;">
                <span style="color: #f59e0b;">Kusin</span><span style="color: #d92d20;">App</span>
              </h2>
              <div style="font-size: 13px; font-weight: 600; color: #667085; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px;">
                Security & Account Recovery
              </div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding: 0 32px 16px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #101828; letter-spacing: -0.02em;">
                Password Reset Code
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #475467; line-height: 1.5;">
                We received a request to reset the password for <strong>${email}</strong>.
              </p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #fef0c7; border: 2px dashed #f59e0b; border-radius: 14px; padding: 24px; text-align: center;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #b54708; margin-bottom: 8px;">
                  Your 6-Digit Verification Code
                </div>
                <div style="font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #b54708; font-family: 'Courier New', Courier, monospace;">
                  ${otpCode}
                </div>
                <div style="font-size: 12px; color: #9a3412; margin-top: 8px;">
                  ⏱ Valid for 10 minutes only
                </div>
              </div>
            </td>
          </tr>

          <!-- Instructions & Warning -->
          <tr>
            <td style="padding: 0 32px 28px; font-size: 14px; line-height: 1.6; color: #475467;">
              <p style="margin: 0 0 12px;">
                Enter this code on the verification screen to choose a new password.
              </p>
              <p style="margin: 0; font-size: 13px; color: #667085;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #eaecf0; padding: 20px 32px; text-align: center; font-size: 12px; color: #667085;">
              © 2026 KusinApp. Recipe & Cost Management Platform.
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
