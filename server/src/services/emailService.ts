import { Resend } from "resend";

export interface EmailConfig {
  resendApiKey: string | null;
  emailFrom: string;
  clientUrl: string;
}

export async function sendPasswordResetEmail(
  config: EmailConfig,
  to: string,
  resetToken: string,
): Promise<void> {
  const resetUrl = `${config.clientUrl.replace(/\/$/, "")}/reset-password?token=${resetToken}`;

  if (!config.resendApiKey) {
    console.log(`[dev] Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  const resend = new Resend(config.resendApiKey);
  const { error } = await resend.emails.send({
    from: config.emailFrom,
    to,
    subject: "Reset your ChoreoLab password",
    html: `
      <p>You requested a password reset for your ChoreoLab account.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `,
  });

  if (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}
