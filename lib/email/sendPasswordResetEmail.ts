import { Resend } from "resend";

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function sendPasswordResetEmail(email: string, resetUrl: string, dict?: any, lang?: string) {
    const subject = dict?.auth?.forgotPasswordEmailSubject || "Reset your Golan Wiki password";
    const title = dict?.auth?.forgotPasswordEmailTitle || "Reset your password";
    const description = dict?.auth?.forgotPasswordEmailDescription || "You requested to reset your password for Golan Wiki.";
    const buttonText = dict?.auth?.forgotPasswordEmailButton || "Reset Password";
    const expiryText = dict?.auth?.forgotPasswordEmailExpiryText || "This link will expire in 30 minutes.";
    const fallbackLinkText = dict?.auth?.forgotPasswordEmailFallbackLinkText || "If the button does not work, copy and paste this link:";
    const ignoreText = dict?.auth?.forgotPasswordEmailIgnoreText || "If you did not request this, you can ignore this email.";

    const isRtl = lang === "ar" || lang === "he";
    const dir = isRtl ? "rtl" : "ltr";
    const textAlign = isRtl ? "right" : "left";

    if (process.env.NODE_ENV === "development") {
        console.log("-----------------------------------------");
        console.log("PASSWORD RESET EMAIL INTERCEPTED IN DEV:");
        console.log("To:", email);
        console.log("Subject:", subject);
        console.log("Reset Link:", resetUrl);
        console.log("-----------------------------------------");
    }

    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is not set.");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const titleEsc = escapeHtml(title);
    const descriptionEsc = escapeHtml(description);
    const buttonTextEsc = escapeHtml(buttonText);
    const expiryTextEsc = escapeHtml(expiryText);
    const fallbackLinkTextEsc = escapeHtml(fallbackLinkText);
    const ignoreTextEsc = escapeHtml(ignoreText);
    const resetUrlEsc = escapeHtml(resetUrl);

    const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "Golan Wiki <onboarding@resend.dev>",
        to: email,
        subject: subject,
        html: `
      <div dir="${dir}" style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; text-align: ${textAlign};">
        <h2>${titleEsc}</h2>

        <p>${descriptionEsc}</p>

        <p>${expiryTextEsc}</p>

        <p>
          <a
            href="${resetUrlEsc}"
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
            ${buttonTextEsc}
          </a>
        </p>

        <p>${fallbackLinkTextEsc}</p>

        <p>
          <a href="${resetUrlEsc}">${resetUrlEsc}</a>
        </p>

        <p>${ignoreTextEsc}</p>
      </div>
    `,
    });

    if (error) {
        console.error("RESEND_EMAIL_ERROR:", error);
        throw new Error("Failed to send password reset email.");
    }
}