import connectDB from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import type { ContactInput } from "@/lib/validators/contact.validator";

interface ContactMessageMeta {
    ip?: string;
    userAgent?: string;
}

interface CreateContactResult {
    success: true;
    id: string;
}

/**
 * Saves a validated contact form submission to MongoDB.
 * Does not expose raw database errors to the caller.
 */
export async function createContactMessage(
    input: ContactInput,
    meta: ContactMessageMeta
): Promise<CreateContactResult> {
    await connectDB();

    const doc = await ContactMessage.create({
        name: input.name,
        email: input.email,
        subject: input.subject,
        reason: input.reason,
        message: input.message,
        source: "contact-page",
        ip: meta.ip,
        userAgent: meta.userAgent,
        // status defaults to "new"
    });

    // TODO: Send email notification to admin here once an email provider is configured.
    // Example with Resend / Nodemailer:
    // await sendContactNotificationEmail({ to: process.env.ADMIN_EMAIL, ...input });

    return { success: true, id: String(doc._id) };
}
