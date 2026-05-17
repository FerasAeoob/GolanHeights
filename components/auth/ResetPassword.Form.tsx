"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { getErrorMessage } from "@/utils/error";

interface ResetPasswordFormProps {
    lang: "en" | "ar" | "he";
    dict?: any;
}

export default function ResetPasswordForm({ lang, dict }: ResetPasswordFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string; form?: string }>({});

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setFieldErrors({});

        if (!token) {
            setFieldErrors({ form: dict?.auth?.invalidOrExpiredToken || "Invalid or expired reset token." });
            return;
        }

        let hasError = false;
        const newErrors: { password?: string; confirmPassword?: string; form?: string } = {};

        if (!password.trim()) {
            newErrors.password = dict?.auth?.errors?.passwordRequired || "Password is required";
            hasError = true;
        } else if (password.length < 8) {
            newErrors.password = dict?.auth?.passwordTooShort || "Password must be at least 8 characters";
            hasError = true;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = dict?.auth?.errors?.passwordsDoNotMatch || "Passwords do not match";
            hasError = true;
        }

        if (hasError) {
            setFieldErrors(newErrors);
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, password, confirmPassword, lang }),
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
            <h1 className="text-xl md:text-3xl font-bold text-white">{dict?.auth?.resetPasswordTitle || "Create new password"}</h1>
            
            {success ? (
                <div className="flex flex-col gap-4">
                    <div className="rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-sm text-green-100">
                        {dict?.auth?.passwordResetSuccess || "Password has been successfully reset."}
                    </div>
                    <Link
                        href={`/${lang}/login`}
                        className="bg-white shadow-lg shadow-black/80 text-green-700 p-3 rounded cursor-pointer mt-2 text-center"
                    >
                        {dict?.auth?.backToLogin || "Back to login"}
                    </Link>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-[2px]">
                        <label htmlFor="password" className="text-white">{dict?.auth?.newPassword || "New Password"}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                                }}
                                aria-invalid={!!fieldErrors.password}
                                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                                className={`w-full text-white bg-black/5 shadow-inner shadow-white/20 rounded-md p-2 pe-10 ${fieldErrors.password
                                    ? "border border-red-400/60 focus:ring-1 focus:ring-red-400/40 focus:border-red-400/60"
                                    : "border border-white/25 focus:border-white"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 -translate-y-1/2 end-3 text-white/70 hover:text-white"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <span id="password-error" className="text-sm text-red-300 mt-1 px-1">{fieldErrors.password}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-[2px]">
                        <label htmlFor="confirmPassword" className="text-white">{dict?.auth?.confirmPassword || "Confirm Password"}</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                            }}
                            aria-invalid={!!fieldErrors.confirmPassword}
                            aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined}
                            className={`w-full text-white bg-black/5 shadow-inner shadow-white/20 rounded-md p-2 ${fieldErrors.confirmPassword
                                ? "border border-red-400/60 focus:ring-1 focus:ring-red-400/40 focus:border-red-400/60"
                                : "border border-white/25 focus:border-white"
                                }`}
                        />
                        {fieldErrors.confirmPassword && (
                            <span id="confirm-password-error" className="text-sm text-red-300 mt-1 px-1">{fieldErrors.confirmPassword}</span>
                        )}
                    </div>

                    {!token && (
                        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 mt-2">
                            {dict?.auth?.invalidOrExpiredToken || "Invalid or expired reset token."}
                        </div>
                    )}

                    {fieldErrors.form && (
                        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 mt-2">
                            {fieldErrors.form}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !token}
                        className="bg-white shadow-lg shadow-black/80 text-green-700 p-3 rounded cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? dict?.auth?.sending || "Sending..." : (dict?.auth?.resetPassword || "Reset Password")}
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
