import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

interface IBusiness {
    businessName: string;
    website?: string;
    instagram?: string;
    verified: boolean;
}

export interface IUser extends Document {
    name: string;
    email: string;
    phone: string;
    image?: string;

    role: "user" | "admin" | "business";
    plan: "free" | "vip";

    password: string;

    favorites: mongoose.Types.ObjectId[];

    business?: IBusiness;

    createdAt: Date;
    updatedAt: Date;

    comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        phone: { type: String, required: true },

        image: { type: String },

        role: {
            type: String,
            enum: ["user", "admin", "business"],
            default: "user",
        },

        plan: {
            type: String,
            enum: ["free", "vip"],
            default: "free",
        },

        password: {
            type: String,
            required: true,
        },

        favorites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Place",
            },
        ],

        business: {
            type: {
                businessName: { type: String, trim: true },
                website: { type: String, trim: true },
                instagram: { type: String, trim: true },
                verified: { type: Boolean, default: false },
            },
            default: undefined,
        },
    },
    { timestamps: true }
);

/**
 * Hash password before saving
 */
UserSchema.pre<IUser>("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compare password for login
 */
UserSchema.methods.comparePassword = async function (candidate: string) {
    return bcrypt.compare(candidate, this.password);
};

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;