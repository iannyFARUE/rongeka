import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Rongeka</span>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:#141414;border:1px solid #262626;border-radius:12px;padding:40px 36px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;font-size:12px;color:#525252;">
              If you didn't request this, you can safely ignore this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">Verify your email</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#a3a3a3;line-height:1.6;">
      Thanks for signing up for Rongeka. Click the button below to verify your email address.
      This link expires in <strong style="color:#e5e5e5;">24 hours</strong>.
    </p>
    <a href="${verifyUrl}"
       style="display:inline-block;padding:12px 28px;background:#ffffff;color:#0a0a0a;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
      Verify email
    </a>
  `;

  await resend.emails.send({
    from: "noreply@rongeka.io",
    to: email,
    subject: "Verify your Rongeka account",
    html: emailWrapper(content),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">Reset your password</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#a3a3a3;line-height:1.6;">
      We received a request to reset the password for your Rongeka account.
      Click the button below to choose a new password.
      This link expires in <strong style="color:#e5e5e5;">1 hour</strong>.
    </p>
    <a href="${resetUrl}"
       style="display:inline-block;padding:12px 28px;background:#ffffff;color:#0a0a0a;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
      Reset password
    </a>
    <p style="margin:28px 0 0;font-size:13px;color:#525252;line-height:1.5;">
      If you didn't request a password reset, your account is safe — no changes were made.
    </p>
  `;

  await resend.emails.send({
    from: "noreply@rongeka.io",
    to: email,
    subject: "Reset your Rongeka password",
    html: emailWrapper(content),
  });
}
