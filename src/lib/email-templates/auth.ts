export const emailTemplates = {
  magicLink: (url: string) => ({
    subject: "Sign in to your account",
    text: `Click this link to sign in to your account: ${url}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Sign in to your account</h1>
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Click the button below to sign in to your account. This link will expire in 24 hours.</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Sign in</a>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn't request this email, you can safely ignore it.</p>
      </div>
    `,
  }),

  verifyEmail: (url: string) => ({
    subject: "Verify your email address",
    text: `Click this link to verify your email address: ${url}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Verify your email address</h1>
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Click the button below to verify your email address. This link will expire in 24 hours.</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Verify email</a>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  }),

  resetPassword: (url: string) => ({
    subject: "Reset your password",
    text: `Click this link to reset your password: ${url}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Reset your password</h1>
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Click the button below to reset your password. This link will expire in 1 hour.</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Reset password</a>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  }),
};