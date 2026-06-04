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

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  console.log('==================================================');
  console.log(`[PASSWORD RESET REQUEST]`);
  console.log(`To email: ${email}`);
  console.log(`Reset link: ${resetUrl}`);
  console.log('==================================================');

  const transporter = getTransporter();
  if (transporter) {
    const mailOptions = {
      from: `"DevCollab" <${process.env.SMTP_FROM || 'no-reply@devcollab.com'}>`,
      to: email,
      subject: 'Reset your DevCollab password',
      text: `Hello,\n\nYou requested a password reset for your DevCollab account. Please reset your password by visiting the following link:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.\n`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; margin-bottom: 24px;">Reset your DevCollab Password</h2>
          <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">You requested a password reset for your DevCollab account. Click the button below to set a new password:</p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #71717a; font-size: 14px; line-height: 1.5;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
          <p style="color: #a1a1aa; font-size: 12px;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:<br/><a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a></p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email successfully sent to: ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      // We do not throw the error to prevent the API from crashing,
      // since the console log fallback already printed the URL.
    }
  }
};
