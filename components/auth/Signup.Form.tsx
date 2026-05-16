"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import { getErrorMessage } from "@/utils/error";

type SignupErrors = {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
    form?: string;
};

export default function SignupForm({ lang, dict }: { lang: "ar" | "en" | "he"; dict: any }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<SignupErrors>({});

    const clearFieldError = (field: keyof SignupErrors) => {
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const getInputClassName = (error?: string, hasIcon: boolean = false) => {
        return `bg-black/5 text-white shadow-inner shadow-white/20 rounded-md p-2 ${hasIcon ? 'pe-10 w-full' : 'w-full'} ${error
            ? "border border-red-400/60 focus:ring-1 focus:ring-red-400/40 focus:border-red-400/60"
            : "border border-white/25 focus:border-white"
            }`;
    };

    const router = useRouter();
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setFieldErrors({});

        let hasError = false;
        const newErrors: SignupErrors = {};

        if (!name.trim()) {
            newErrors.name = dict?.auth?.errors?.nameRequired || "Name is required";
            hasError = true;
        } else if (name.trim().length < 2) {
            newErrors.name = dict?.auth?.errors?.nameTooShort || "Name must be at least 2 characters";
            hasError = true;
        }

        if (!email.trim()) {
            newErrors.email = dict?.auth?.errors?.emailRequired || "Email is required";
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = dict?.auth?.errors?.emailInvalid || "Please enter a valid email address";
            hasError = true;
        }

        if (!password) {
            newErrors.password = dict?.auth?.errors?.passwordRequired || "Password is required";
            hasError = true;
        } else if (password.length < 8) {
            newErrors.password = dict?.auth?.errors?.passwordTooShort || "Password must be at least 8 characters";
            hasError = true;
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = dict?.auth?.errors?.confirmPasswordRequired || "Please confirm your password";
            hasError = true;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = dict?.auth?.errors?.passwordsDoNotMatch || "Passwords do not match";
            hasError = true;
        }

        if (!acceptTerms) {
            newErrors.acceptTerms = dict?.auth?.errors?.acceptTermsRequired || "You must accept the Terms of Use and Privacy Policy";
            hasError = true;
        }

        if (hasError) {
            setFieldErrors(newErrors);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch("/api/auth/register", {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    phone: phone.trim() || undefined,
                    password,
                    acceptTerms,
                })
            });

            const data = await res.json();

            if (!res.ok) {
                const errorMessage = getErrorMessage(data, dict);
                if (data.field) {
                    setFieldErrors({ [data.field]: errorMessage });
                } else {
                    setFieldErrors({ form: errorMessage });
                }
                setLoading(false);
                return;
            }

            // Success — reset form and navigate
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setPhone("");
            setLoading(false);
            router.push(`/${lang}/login`);
            router.refresh();
        } catch {
            // Only true network errors reach here (fetch failed, JSON parse failed, etc.)
            setFieldErrors({ form: dict?.auth?.errors?.somethingWentWrong || "Something went wrong. Please try again." });
            setLoading(false);
        }

    }



    return (
        <form className="flex flex-col gap-4 rounded-2xl border border-white/25 bg-white/0.1 backdrop-blur-[3px] p-6 sm:p-8 shadow-xl w-full max-w-md mx-auto h-auto box-border"
            onSubmit={handleSubmit}>

            <h1 className="text-xl md:text-3xl font-bold text-white">{dict?.auth?.titleSignup || "Create Account"}</h1>

            <div className="flex flex-col gap-4 ">
                <div className="flex flex-col gap-[2px]">
                    <label htmlFor="name" className="text-white">{dict?.auth?.name}</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        placeholder={dict?.auth?.required}
                        onChange={(e) => {
                            setName(e.target.value);
                            clearFieldError("name");
                        }}
                        aria-invalid={!!fieldErrors.name}
                        aria-describedby={fieldErrors.name ? "name-error" : undefined}
                        className={getInputClassName(fieldErrors.name)}
                    />
                    {fieldErrors.name && <span id="name-error" className="text-red-300 text-sm mt-1 px-1">{fieldErrors.name}</span>}
                </div>
                <div className="flex flex-col gap-[2px]">
                    <label htmlFor="phone" className="text-white">{dict?.auth?.phone}</label>
                    <input
                        id="phone"
                        name="phone"
                        type="text"
                        value={phone}
                        placeholder={dict?.auth?.optional}
                        onChange={(e) => {
                            setPhone(e.target.value);
                            clearFieldError("phone");
                        }}
                        aria-invalid={!!fieldErrors.phone}
                        aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                        className={getInputClassName(fieldErrors.phone)}
                    />
                    {fieldErrors.phone && <span id="phone-error" className="text-red-300 text-sm mt-1 px-1">{fieldErrors.phone}</span>}
                </div>
                <div className="flex flex-col gap-[2px]">
                    <label htmlFor="email" className="text-white">{dict?.auth?.email}</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        placeholder={dict?.auth?.required}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            clearFieldError("email");
                        }}
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={fieldErrors.email ? "email-error" : undefined}
                        className={getInputClassName(fieldErrors.email)}
                    />
                    {fieldErrors.email && <span id="email-error" className="text-red-300 text-sm mt-1 px-1">{fieldErrors.email}</span>}
                </div>
                <div className="flex flex-col gap-[2px]">
                    <label htmlFor="password" className="text-white">{dict?.auth?.password}</label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            placeholder={dict?.auth?.required}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                clearFieldError("password");
                            }}
                            aria-invalid={!!fieldErrors.password}
                            aria-describedby={fieldErrors.password ? "password-error" : undefined}
                            className={getInputClassName(fieldErrors.password, true)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-1/2 -translate-y-1/2 end-3 text-white/70 hover:text-white"
                            aria-label={showPassword ? dict?.auth?.hidePassword || "Hide password" : dict?.auth?.showPassword || "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {fieldErrors.password && <span id="password-error" className="text-red-300 text-sm mt-1 px-1">{fieldErrors.password}</span>}
                </div>
                <div className="flex flex-col gap-[2px]">
                    <label htmlFor="confirmPassword" className="text-white">{dict?.auth?.confirmPassword}</label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            placeholder={dict?.auth?.required}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                clearFieldError("confirmPassword");
                            }}
                            aria-invalid={!!fieldErrors.confirmPassword}
                            aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined}
                            className={getInputClassName(fieldErrors.confirmPassword, true)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute top-1/2 -translate-y-1/2 end-3 text-white/70 hover:text-white"
                            aria-label={showConfirmPassword ? dict?.auth?.hidePassword || "Hide password" : dict?.auth?.showPassword || "Show password"}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {fieldErrors.confirmPassword && <span id="confirm-password-error" className="text-red-300 text-sm mt-1 px-1">{fieldErrors.confirmPassword}</span>}
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="acceptTerms"
                        checked={acceptTerms}
                        onChange={(e) => {
                            setAcceptTerms(e.target.checked);
                            clearFieldError("acceptTerms");
                        }}
                        name="acceptTerms"
                        className=" w-4 h-4 shrink-0 rounded border-white/25 bg-black/5 text-green-600 focus:ring-green-500 cursor-pointer"
                        aria-invalid={!!fieldErrors.acceptTerms}
                        aria-describedby={fieldErrors.acceptTerms ? "accept-terms-error" : undefined}
                    />
                    <label htmlFor="acceptTerms" className="text-white text-sm cursor-pointer select-none leading-tight">
                        {dict?.auth?.acceptTermsPrefix || "I agree to the"}{" "}
                        <Link href={`/${lang}/terms-of-use`} className="underline hover:text-green-300">
                            {dict?.auth?.termsOfUse || "Terms of Use"}
                        </Link>{" "}
                        {dict?.auth?.acceptTermsMiddle || "and"}{" "}
                        <Link href={`/${lang}/privacy-policy`} className="underline hover:text-green-300">
                            {dict?.auth?.privacyPolicy || "Privacy Policy"}
                        </Link>
                    </label>
                </div>
                {fieldErrors.acceptTerms && <span id="accept-terms-error" className="text-red-300 text-sm px-1">{fieldErrors.acceptTerms}</span>}

                {fieldErrors.form && (
                    <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 mt-2">
                        {fieldErrors.form}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-white shadow-lg shadow-black/80  text-green-700 p-3 rounded cursor-pointer"
                >
                    {loading ? dict?.auth?.creatingAccount : dict?.auth?.createAccount}
                </button>
                <p className="text-center text-white mt-4 ">
                    {dict?.auth?.alreadyHaveAccount} <Link href={`/${lang}/login`} className=" bg-white p-1 rounded text-green-700 underline">{dict?.auth?.login}</Link>
                </p>
            </div>
        </form>
    );
}