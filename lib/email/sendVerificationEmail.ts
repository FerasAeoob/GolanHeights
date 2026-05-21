import { Resend } from "resend";

export async function sendVerificationEmail(email: string, verifyUrl: string, dict?: any) {
    const subject = dict?.auth?.verifyEmailEmailSubject || "Verify your Golan Wiki email";
    const title = dict?.auth?.verifyEmailEmailTitle || "Verify your email address";
    const description = dict?.auth?.verifyEmailEmailDescription || "Welcome to Golan Wiki! Please verify your email address to unlock all features.";
    const buttonText = dict?.auth?.verifyEmailButton || "Verify Email";
    const expiryText = dict?.auth?.verifyEmailExpiryText || "This link will expire in 24 hours.";
    const fallbackLinkText = dict?.auth?.verifyEmailFallbackLinkText || "If the button does not work, copy and paste this link:";
    const ignoreText = dict?.auth?.verifyEmailIgnoreText || "If you did not create an account, you can safely ignore this email.";

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

    const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "Golan Wiki <onboarding@resend.dev>",
        to: email,
        subject: subject,
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>${title}</h2>

        <p>${description}</p>

        <p>${expiryText}</p>

        <p>
          <a
            href="${verifyUrl}"
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
            ${buttonText}
          </a>
        </p>

        <p>${fallbackLinkText}</p>

        <p>
          <a href="${verifyUrl}">${verifyUrl}</a>
        </p>

        <p>${ignoreText}</p>
      </div>
    `,
    });

    if (error) {
        console.error("RESEND_EMAIL_ERROR:", error);
        throw new Error("Failed to send verification email.");
    }
}
