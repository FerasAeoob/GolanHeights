import mongoose, { Schema, Document, Model } from "mongoose";
import { CONTACT_REASONS } from "@/lib/validators/contact.validator";

export interface IContactMessage extends Document {
    name: string;
    email: string;
    subject: string;
    reason: (typeof CONTACT_REASONS)[number];
    message: string;
    status: "new" | "read" | "archived";
    source: string;
    ip?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ContactMessageSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 120,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        reason: {
            type: String,
            required: true,
            enum: CONTACT_REASONS,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        status: {
            type: String,
            enum: ["new", "read", "archived"],
            default: "new",
        },
        source: {
            type: String,
            default: "contact-page",
        },
        ip: {
            type: String,
        },
        userAgent: {
            type: String,
        },
    },
    { timestamps: true }
);

// Indexes for admin dashboard queries
ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ status: 1 });
ContactMessageSchema.index({ reason: 1 });
ContactMessageSchema.index({ email: 1 });

/**
 * Export model safely (Next.js HMR hot-reload guard)
 */
const ContactMessage: Model<IContactMessage> =
    mongoose.models.ContactMessage ||
    mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);

export default ContactMessage;
