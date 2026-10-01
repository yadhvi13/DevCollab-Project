import nodemailer from 'nodemailer';

// Configure SMTP or fallback transporter
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }
  return null;
};

export const sendResetPasswordEmail = async (email: string, token: string): Promise<string> => {
  // Use Next.js port 3000 by default
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  console.log('==================================================');
  console.log(`[PASSWORD RESET REQUEST]`);
  console.log(`To email: ${email}`);
  console.log(`Reset link: ${resetUrl}`);
  console.log('==================================================');

  let transporter = getTransporter();

  // If no SMTP configured, attempt to use ethereal test account for realistic email preview
  if (!transporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch {
      // Fallback: console log and direct link
    }
  }

  if (transporter) {
    const mailOptions = {
      from: `"DevCollab" <${process.env.SMTP_FROM || 'no-reply@devcollab.network'}>`,
      to: email,
      subject: 'Reset your DevCollab password',
      text: `Hello,\n\nYou requested a password reset for your DevCollab account. Please reset your password by visiting the following link:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.\n`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #27272a; border-radius: 16px; background-color: #090909; color: #f4f4f5;">
          <div style="margin-bottom: 24px;">
            <div style="display: inline-block; width: 36px; height: 36px; line-height: 36px; text-align: center; border-radius: 8px; background-color: #B7194B; color: #ffffff; font-weight: 900; font-size: 16px;">DC</div>
            <span style="font-weight: 800; font-size: 18px; margin-left: 10px; color: #ffffff; letter-spacing: 0.5px;">DEV COLLAB</span>
          </div>
          <h2 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px;">Reset your password</h2>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">Hello,<br/>You recently requested to reset your password for your DevCollab workspace account. Click the button below to proceed:</p>
          <div style="margin: 28px 0; text-align: left;">
            <a href="${resetUrl}" style="background-color: #B7194B; color: #ffffff; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-block; letter-spacing: 0.5px;">RESET PASSWORD →</a>
          </div>
          <p style="color: #71717a; font-size: 12px; line-height: 1.5;">This password reset link will expire in 1 hour. If you did not request this reset, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #27272a; margin: 24px 0;" />
          <p style="color: #52525b; font-size: 11px; line-height: 1.5;">If you're having trouble clicking the button, copy and paste this URL into your browser:<br/><a href="${resetUrl}" style="color: #B7194B; word-break: break-all;">${resetUrl}</a></p>
        </div>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Password reset email successfully sent to: ${email}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`Preview email URL: ${previewUrl}`);
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }
  }

  return resetUrl;
};
