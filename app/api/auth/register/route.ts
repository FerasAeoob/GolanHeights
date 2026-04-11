import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { registerSchema } from "@/database/user/user.schema";
import { createUserToken, setAuthCookie, serializeUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const validatedData = registerSchema.parse(body);

        const existingUser = await User.findOne({ email: validatedData.email });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "Email already in use" },
                { status: 409 }
            );
        }

        const user = await User.create({
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            image: validatedData.image || "",
            password: validatedData.password,
            role: "user",
            plan: "free",
            favorites: [],
        });



        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully",
                user: serializeUser(user),
            },
            { status: 201 }
        );
        redirect("/[locale]/login");
    } catch (error: any) {
        if (error?.name === "ZodError") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: error.issues,
                },
                { status: 400 }
            );
        }

        console.error("REGISTER ERROR:", error);

        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }
}