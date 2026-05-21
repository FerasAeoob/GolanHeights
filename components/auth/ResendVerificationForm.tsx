"use client";

import { useState } from "react";
import Link from "next/link";
import { getErrorMessage } from "@/utils/error";

interface ResendVerificationFormProps {
    lang: "en" | "ar" | "he";
    dict?: any;
}

export default function ResendVerificationForm({ lang, dict }: ResendVerificationFormProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; form?: string }>({});

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setFieldErrors({});
        setMessage("");
        setSuccess(false);

        if (!email.trim()) {
            setFieldErrors({ email: dict?.auth?.emailRequired || "Email is required." });
            return;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFieldErrors({ email: dict?.auth?.errors?.emailInvalid || "Please enter a valid email address" });
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/auth/send-verification-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, lang }),
            });

            const data = await res.json();

            if (!res.ok) {
                setFieldErrors({ form: getErrorMessage(data, dict) });
                return;
            }

            setSuccess(true);
            setMessage(dict?.auth?.verificationEmailSent || "If an account with this email exists and is not verified, a verification link has been sent.");
        } catch {
            setFieldErrors({ form: getErrorMessage({ errorCode: "NETWORK_ERROR" }, dict) });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl border border-white/25 bg-white/10 backdrop-blur-[3px] p-6 sm:p-8 shadow-xl w-full max-w-md mx-auto h-auto box-border animate-in fade-in duration-300"
        >
            <h1 className="text-xl md:text-3xl font-bold text-white">
                {dict?.auth?.resendVerificationTitle || "Resend Verification Email"}
            </h1>

            {success ? (
                <div className="flex flex-col gap-4">
                    <div className="rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-sm text-green-100 font-medium">
                        {message}
                    </div>
                    <Link
                        href={`/${lang}/login`}
                        className="bg-white shadow-lg shadow-black/80 text-green-700 p-3 rounded cursor-pointer mt-2 text-center font-semibold transition-transform hover:scale-[1.01]"
                    >
                        {dict?.auth?.backToLogin || "Back to login"}
                    </Link>
                </div>
            ) : (
                <>
                    <p className="text-sm text-white/80">
                        {dict?.auth?.resendVerificationDescription || "Enter your email address to receive a new verification link."}
                    </p>

                    <div className="flex flex-col gap-[2px]">
                        <label htmlFor="email" className="text-white font-medium">
                            {dict?.auth?.email || "Email"}
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            placeholder={dict?.auth?.emailPlaceholder || "Enter your email"}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                            }}
                            aria-invalid={!!fieldErrors.email}
                            aria-describedby={fieldErrors.email ? "email-error" : undefined}
                            className={`text-white bg-black/5 shadow-inner shadow-white/20 rounded-md p-2 ${
                                fieldErrors.email
                                    ? "border border-red-400/60 focus:ring-1 focus:ring-red-400/40 focus:border-red-400/60"
                                    : "border border-white/25 focus:border-white"
                            }`}
                        />
                        {fieldErrors.email && (
                            <span id="email-error" className="text-sm text-red-300 mt-1 px-1">
                                {fieldErrors.email}
                            </span>
                        )}
                    </div>

                    {fieldErrors.form && (
                        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 mt-2 font-medium">
                            {fieldErrors.form}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-white shadow-lg shadow-black/80 text-green-700 p-3 rounded cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-transform hover:scale-[1.01]"
                    >
                        {loading ? (dict?.auth?.resendingVerification || "Resending...") : (dict?.auth?.resendVerificationButton || "Resend Verification")}
                    </button>

                    <div className="mt-4 text-center">
                        <Link
                            href={`/${lang}/login`}
                            className="text-white/80 hover:text-white underline text-sm transition-colors"
                        >
                            {dict?.auth?.backToLogin || "Back to login"}
                        </Link>
                    </div>
                </>
            )}
        </form>
    );
}
