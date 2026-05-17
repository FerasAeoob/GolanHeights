import { Resend } from "resend";

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
    if (process.env.NODE_ENV === "development") {
        console.log("-----------------------------------------");
        console.log("PASSWORD RESET EMAIL INTERCEPTED IN DEV:");
        console.log("To:", email);
        console.log("Reset Link:", resetUrl);
        console.log("-----------------------------------------");
    }

    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is not set.");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "Golan Wiki <onboarding@resend.dev>",
        to: email,
        subject: "Reset your Golan Wiki password",
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Reset your password</h2>

        <p>You requested to reset your password for Golan Wiki.</p>

        <p>This link will expire in 30 minutes.</p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 18px;
              background: #059669;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            "
          >
            Reset Password
          </a>
        </p>

        <p>If the button does not work, copy and paste this link:</p>

        <p>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>

        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
    });

    if (error) {
        console.error("RESEND_EMAIL_ERROR:", error);
        throw new Error("Failed to send password reset email.");
    }
}