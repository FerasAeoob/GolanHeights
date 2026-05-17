import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { resetPasswordSchema } from "@/database/user/user.schema";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import crypto from "crypto";
import { getDictionary } from "@/lib/get-dictionary";

export const runtime = "nodejs";

const resetPasswordLimiter = { name: "reset-password", maxRequests: 3, windowSeconds: 15 * 60 };

export async function POST(req: NextRequest) {
    let dict: any = {};
    try {
        const body = await req.json();
        const lang = body.lang || "en";
        dict = await getDictionary(lang);

        const ip = getClientIp(req);
        const { allowed } = checkRateLimit(resetPasswordLimiter, ip);
        if (!allowed) {
            return NextResponse.json(
                { success: false, message: dict?.auth?.rateLimited || "You have made too many attempts. Please wait 15 minutes." },
                { status: 429 }
            );
        }

        await connectDB();
        const validatedData = resetPasswordSchema.parse(body);

        const hashedToken = crypto.createHash("sha256").update(validatedData.token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: dict?.auth?.invalidToken || "The password reset link is invalid or expired." },
                { status: 400 }
            );
        }

        user.password = validatedData.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return NextResponse.json(
            { success: true, message: dict?.auth?.passwordResetSuccess || "Password updated successfully." },
            { status: 200 }
        );

    } catch (error: any) {
        if (error?.name === "ZodError") {
            const firstError = error.issues[0]?.message;
            let message = dict?.auth?.validationFailed || "Please check your input and try again.";
            let field = error.issues[0]?.path[0];

            if (firstError === "TOKEN_REQUIRED") message = dict?.auth?.tokenRequired || "Reset token is required.";
            if (firstError === "PASSWORD_TOO_SHORT") message = dict?.auth?.passwordTooShort || "Password must be at least 8 characters.";
            if (firstError === "PASSWORDS_DO_NOT_MATCH") message = dict?.auth?.passwordsDoNotMatch || "Passwords do not match.";

            return NextResponse.json(
                { success: false, message, field },
                { status: 400 }
            );
        }
        console.error("RESET PASSWORD ERROR:", error);
        return NextResponse.json(
            { success: false, message: dict?.auth?.unknownError || "An unexpected error occurred. Please try again later." },
            { status: 500 }
        );
    }
}
