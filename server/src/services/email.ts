interface SendResetEmailInput {
  to: string;
  resetLink: string;
}

const resendApiKey = process.env.RESEND_API_KEY || "";
const resendFromEmail = process.env.RESEND_FROM_EMAIL || "";

const buildResetEmailHtml = (resetLink: string) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
    <h2>Password Reset Request</h2>
    <p>You requested a password reset for your account.</p>
    <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
    <p><a href="${resetLink}" target="_blank" rel="noopener noreferrer">${resetLink}</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  </div>
`;

export const canSendResetEmail = () => Boolean(resendApiKey && resendFromEmail);

export const sendResetEmail = async ({ to, resetLink }: SendResetEmailInput): Promise<void> => {
  if (!canSendResetEmail()) {
    throw new Error("Email provider is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: [to],
      subject: "Reset your password",
      html: buildResetEmailHtml(resetLink),
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to send reset email: ${message || response.status}`);
  }
};
