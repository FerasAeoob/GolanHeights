import { Resend } from "resend";

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function sendVerificationEmail(email: string, verifyUrl: string, dict?: any, lang?: string) {
    const subject = dict?.auth?.verifyEmailEmailSubject || "Verify your Golan Wiki email";
    const title = dict?.auth?.verifyEmailEmailTitle || "Verify your email address";
    const description = dict?.auth?.verifyEmailEmailDescription || "Welcome to Golan Wiki! Please verify your email address to unlock all features.";
    const buttonText = dict?.auth?.verifyEmailButton || "Verify Email";
    const expiryText = dict?.auth?.verifyEmailExpiryText || "This link will expire in 24 hours.";
    const fallbackLinkText = dict?.auth?.verifyEmailFallbackLinkText || "If the button does not work, copy and paste this link:";
    const ignoreText = dict?.auth?.verifyEmailIgnoreText || "If you did not create an account, you can safely ignore this email.";

    const isRtl = lang === "ar" || lang === "he";
    const dir = isRtl ? "rtl" : "ltr";
    const textAlign = isRtl ? "right" : "left";

    if (process.env.NODE_ENV === "development") {
        console.log("-----------------------------------------");
        console.log("EMAIL VERIFICATION INTERCEPTED IN DEV:");
        console.log("To:", email);
        console.log("Subject:", subject);
        console.log("Verify Link:", verifyUrl);
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
    const verifyUrlEsc = escapeHtml(verifyUrl);

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
            href="${verifyUrlEsc}"
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
          <a href="${verifyUrlEsc}">${verifyUrlEsc}</a>
        </p>

        <p>${ignoreTextEsc}</p>
      </div>
    `,
    });

    if (error) {
        console.error("RESEND_EMAIL_ERROR:", error);
        throw new Error("Failed to send verification email.");
    }
}

export async function sendEmailChangeCodeEmail(email: string, code: string, dict?: any, lang?: string) {
    const subject = dict?.auth?.emailChangeCodeSubject || "Confirm your Golan Wiki email change";
    const title = dict?.auth?.emailChangeCodeTitle || "Confirm Email Change";
    const description = dict?.auth?.emailChangeCodeDescription || "Someone requested to change your Golan Wiki account email address. Use the following 6-digit code to confirm this change:";
    const expiryText = dict?.auth?.emailChangeCodeExpiry || "This code expires in 10 minutes.";
    const ignoreText = dict?.auth?.emailChangeCodeIgnore || "If this was not you, you can safely ignore this email and do not share the code.";

    const isRtl = lang === "ar" || lang === "he";
    const dir = isRtl ? "rtl" : "ltr";
    const textAlign = isRtl ? "right" : "left";

    if (process.env.NODE_ENV === "development") {
        console.log("-----------------------------------------");
        console.log("EMAIL CHANGE CODE INTERCEPTED IN DEV:");
        console.log("To:", email);
        console.log("Subject:", subject);
        console.log("Code:", code);
        console.log("-----------------------------------------");
    }

    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is not set.");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const titleEsc = escapeHtml(title);
    const descriptionEsc = escapeHtml(description);
    const codeEsc = escapeHtml(code);
    const expiryTextEsc = escapeHtml(expiryText);
    const ignoreTextEsc = escapeHtml(ignoreText);

    const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "Golan Wiki <onboarding@resend.dev>",
        to: email,
        subject: subject,
        html: `
      <div dir="${dir}" style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: ${textAlign};">
        <h2 style="color: #0f172a; margin-bottom: 16px;">${titleEsc}</h2>

        <p style="color: #475569; font-size: 16px; margin-bottom: 24px;">${descriptionEsc}</p>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">${codeEsc}</span>
        </div>

        <p style="color: #64748b; font-size: 14px; margin-bottom: 12px;">${expiryTextEsc}</p>

        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">${ignoreTextEsc}</p>
      </div>
    `,
    });

    if (error) {
        console.error("RESEND_EMAIL_ERROR:", error);
        throw new Error("Failed to send email change code.");
    }
}
