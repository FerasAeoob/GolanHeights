"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { getErrorMessage } from "@/utils/error";

interface LoginFormProps {
    lang: "en" | "ar" | "he";
    dict?: any;
}

export default function LoginForm({ lang, dict }: LoginFormProps) {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; form?: string }>({});

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setFieldErrors({});

        let hasError = false;
        const newErrors: { email?: string; password?: string; form?: string } = {};

        if (!email.trim()) {
            newErrors.email = dict?.auth?.errors?.emailRequired || "Email is required";
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = dict?.auth?.errors?.emailInvalid || "Please enter a valid email address";
            hasError = true;
        }

        if (!password.trim()) {
            newErrors.password = dict?.auth?.errors?.passwordRequired || "Password is required";
            hasError = true;
        }

        if (hasError) {
            setFieldErrors(newErrors);
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    rememberMe,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                let errorMessage = getErrorMessage(data, dict);

                if (res.status === 429 || data.error === "TOO_MANY_ATTEMPTS" || data.errorCode === "RATE_LIMITED") {
                    let waitMinutes = 15;
                    if (data.retryAfter !== undefined && data.retryAfter !== null) {
                        waitMinutes = Math.ceil(Number(data.retryAfter) / 60);
                    } else if (data.resetAt !== undefined && data.resetAt !== null) {
                        const secondsLeft = Math.ceil((Number(data.resetAt) - Date.now()) / 1000);
                        waitMinutes = Math.ceil(Math.max(secondsLeft, 1) / 60);
                    }
                    waitMinutes = Math.max(waitMinutes, 1);

                    const translation = dict?.auth?.errors?.tooManyLoginAttemptsMinutes;
                    if (translation) {
                        errorMessage = translation.replace("{minutes}", String(waitMinutes));
                    } else {
                        if (lang === "he") {
                            errorMessage = `ביצעת יותר מדי ניסיונות התחברות. אנא נסה שוב בעוד ${waitMinutes} דקות.`;
                        } else if (lang === "ar") {
                            errorMessage = `لقد قمت بمحاولات تسجيل دخول كثيرة. يرجى المحاولة مرة أخرى بعد ${waitMinutes} دقائق.`;
                        } else {
                            errorMessage = `Too many login attempts. Please try again in ${waitMinutes} minutes.`;
                        }
                    }
                }

                if (data.errorCode === "INVALID_CREDENTIALS") {
                    setFieldErrors({ form: dict?.auth?.errors?.invalidCredentials || errorMessage });
                } else if (data.field) {
                    setFieldErrors({ [data.field]: errorMessage });
                } else {
                    setFieldErrors({ form: errorMessage });
                }
                return;
            }

            router.push(`/${lang}`);
            router.refresh();
        } catch {
            setFieldErrors({ form: getErrorMessage({ errorCode: "NETWORK_ERROR" }, dict) });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl border border-white/25 bg-white/10 backdrop-blur-[3px] p-6 sm:p-8 shadow-xl w-full max-w-md mx-auto h-auto box-border"
        >
            <h1 className="text-xl md:text-3xl font-bold text-white">{dict?.auth?.titleLogin || "Login"}</h1>
            <div className="flex flex-col gap-[2px]">
                <label htmlFor="email" className="text-white">{dict?.auth?.email}</label>
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
            <div className="flex flex-col gap-[2px]">
                <label htmlFor="password" className="text-white">{dict?.auth?.password}</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        placeholder={dict?.auth?.passwordPlaceholder}
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

            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-white/25 bg-black/5 text-green-600 focus:ring-green-500 cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="text-white text-sm cursor-pointer select-none">
                        {dict?.auth?.rememberMe || "Remember me"}
                    </label>
                </div>
                <Link
                    href={`/${lang}/forgot-password`}
                    className="text-sm text-white/80 hover:text-white transition-colors underline"
                >
                    {dict?.auth?.forgotPassword || "Forgot password?"}
                </Link>
            </div>

            {fieldErrors.form && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 mt-2">
                    {fieldErrors.form}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="bg-white shadow-lg shadow-black/80 text-green-700 p-3 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
                {loading ? dict?.auth?.loggingIn || "Logging in..." : dict?.auth?.login}
            </button>
            <p className="text-center text-white mt-4 ">
                {dict?.auth?.noAccount} <Link href={`/${lang}/signup`} className=" bg-white p-1 rounded text-green-700 underline font-semibold">{dict?.auth?.createAccount}</Link>
            </p>
        </form>
    );
}