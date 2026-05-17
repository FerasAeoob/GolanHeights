"use client";

import { useState } from "react";
import Link from "next/link";
import { getErrorMessage } from "@/utils/error";

interface ForgotPasswordFormProps {
    lang: "en" | "ar" | "he";
    dict?: any;
}

export default function ForgotPasswordForm({ lang, dict }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; form?: string }>({});

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setFieldErrors({});

        if (!email.trim()) {
            setFieldErrors({ email: dict?.auth?.errors?.emailRequired || "Email is required" });
            return;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFieldErrors({ email: dict?.auth?.errors?.emailInvalid || "Please enter a valid email address" });
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, lang }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.field) {
                    setFieldErrors({ [data.field]: data.message || getErrorMessage(data, dict) });
                } else {
                    setFieldErrors({ form: data.message || getErrorMessage(data, dict) });
                }
                return;
            }

            setSuccess(true);
        } catch {
            setFieldErrors({ form: dict?.auth?.errors?.somethingWentWrong || 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl border border-white/25 bg-white/0.1 backdrop-blur-[3px] p-6 sm:p-8 shadow-xl w-full max-w-md mx-auto h-auto box-border"
        >
            <h1 className="text-xl md:text-3xl font-bold text-white">{dict?.auth?.forgotPasswordTitle || "Reset your password"}</h1>

            {success ? (
                <div className="flex flex-col gap-4">
                    <div className="rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-sm text-green-100">
                        {dict?.auth?.genericResetEmailSent || "If an account with this email exists, we sent a reset link."}
                    </div>
                    <Link
                        href={`/${lang}/login`}
                        className="text-center text-white/80 hover:text-white underline mt-2"
                    >
                        {dict?.auth?.backToLogin || "Back to login"}
                    </Link>
                </div>
            ) : (
                <>
                    <p className="text-sm text-white/80">
                        {dict?.auth?.forgotPasswordDescription || "Enter your email and we will send you a reset link"}
                    </p>
                    <div className="flex flex-col gap-[2px]">
                        <label htmlFor="email" className="text-white">{dict?.auth?.email || "Email"}</label>
                        <input
                            type="email"
                            value={email}
                            placeholder={dict?.auth?.emailPlaceholder}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                            }}
                            aria-invalid={!!fieldErrors.email}
                            aria-describedby={fieldErrors.email ? "email-error" : undefined}
                            className={`text-white bg-black/5 shadow-inner shadow-white/20 rounded-md p-2 ${fieldErrors.email
                                ? "border border-red-400/60 focus:ring-1 focus:ring-red-400/40 focus:border-red-400/60"
                                : "border border-white/25 focus:border-white"
                                }`}
                        />
                        {fieldErrors.email && (
                            <span id="email-error" className="text-sm text-red-300 mt-1 px-1">{fieldErrors.email}</span>
                        )}
                    </div>

                    {fieldErrors.form && (
                        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 mt-2">
                            {fieldErrors.form}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-white shadow-lg shadow-black/80 text-green-700 p-3 rounded cursor-pointer mt-2"
                    >
                        {loading ? dict?.auth?.sending || "Sending..." : (dict?.auth?.sendResetLink || "Send reset link")}
                    </button>

                    <div className="mt-4 text-center">
                        <Link
                            href={`/${lang}/login`}
                            className="text-white/80 hover:text-white underline text-sm"
                        >
                            {dict?.auth?.backToLogin || "Back to login"}
                        </Link>
                    </div>
                </>
            )}
        </form>
    );
}
