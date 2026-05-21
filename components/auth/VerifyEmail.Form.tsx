"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getErrorMessage } from "@/utils/error";

interface VerifyEmailFormProps {
    lang: "en" | "ar" | "he";
    dict?: any;
}

export default function VerifyEmailForm({ lang, dict }: VerifyEmailFormProps) {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const hasCalledVerify = useRef(false);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ form?: string }>({});

    async function verifyToken(verificationToken: string) {
        try {
            setLoading(true);
            setFieldErrors({});

            const res = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: verificationToken, lang }),
            });

            const data = await res.json();

            if (!res.ok) {
                setFieldErrors({ form: getErrorMessage(data, dict) });
                return;
            }

            setSuccess(true);
        } catch {
            setFieldErrors({ form: getErrorMessage({ errorCode: "NETWORK_ERROR" }, dict) });
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
        if (e) e.preventDefault();
        if (!token) {
            setFieldErrors({ form: dict?.auth?.invalidOrExpiredVerificationToken || "Invalid or expired verification token." });
            return;
        }
        await verifyToken(token);
    }

    // Auto-verify on mount if token exists
    useEffect(() => {
        if (token) {
            if (!hasCalledVerify.current) {
                hasCalledVerify.current = true;
                verifyToken(token);
            }
        } else {
            setFieldErrors({ form: dict?.auth?.invalidOrExpiredVerificationToken || "Invalid or expired verification token." });
        }
    }, [token, dict]);

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl border border-white/25 bg-white/10 backdrop-blur-[3px] p-6 sm:p-8 shadow-xl w-full max-w-md mx-auto h-auto box-border"
        >
            <h1 className="text-xl md:text-3xl font-bold text-white text-center">
                {dict?.auth?.verifyEmailTitle || "Verify Email"}
            </h1>
            
            {success ? (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                    <div className="rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-sm text-green-100 text-center font-medium">
                        {dict?.auth?.emailVerifiedSuccess || "Your email has been successfully verified."}
                    </div>
                    <Link
                        href={`/${lang}/profile`}
                        className="bg-white shadow-lg shadow-black/80 text-green-700 p-3 rounded cursor-pointer mt-2 text-center font-semibold transition-transform hover:scale-[1.01]"
                    >
                        {dict?.profile?.title || "Go to Profile / Settings"}
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <p className="text-white/90 text-center text-sm md:text-base">
                        {dict?.auth?.verifyEmailDescription || "Click the button below to verify your email address and activate your account."}
                    </p>

                    {fieldErrors.form && (
                        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 mt-2 text-center font-medium">
                            {fieldErrors.form}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !token}
                        className="bg-white shadow-lg shadow-black/80 text-green-700 p-3 rounded cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-transform hover:scale-[1.01]"
                    >
                        {loading ? (dict?.auth?.verifying || "Verifying...") : (dict?.auth?.verifyEmailButton || "Verify Email")}
                    </button>
                    
                    <div className="mt-4 text-center">
                        <Link
                            href={`/${lang}/login`}
                            className="text-white/80 hover:text-white underline text-sm transition-colors"
                        >
                            {dict?.auth?.backToLogin || "Back to login"}
                        </Link>
                    </div>
                </div>
            )}
        </form>
    );
}
