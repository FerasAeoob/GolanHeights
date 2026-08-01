"use client";

import { useState } from "react";
import { Mail, CheckCircle2, XCircle, Loader2, Save, Send, Key } from "lucide-react";
import { getErrorMessage } from "@/utils/error";
import { useRouter } from "next/navigation";

interface EmailSettingsFormProps {
    user: {
        _id: string;
        email: string;
        isVerified?: boolean;
    };
    dict: Record<string, any>;
    lang: string;
}

export default function EmailSettingsForm({ user, dict, lang }: EmailSettingsFormProps) {
    const router = useRouter();
    const s = dict?.settings || {};
    const err = dict?.errors || {};

    const [email, setEmail] = useState(user.email || "");
    const [isVerified, setIsVerified] = useState(user.isVerified || false);
    const [currentEmail, setCurrentEmail] = useState(user.email || "");

    // Resend states
    const [sendingLink, setSendingLink] = useState(false);
    const [resendMessage, setResendMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Save states
    const [savingEmail, setSavingEmail] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Code confirmation step states
    const [showCodeStep, setShowCodeStep] = useState(false);
    const [code, setCode] = useState("");
    const [confirmingCode, setConfirmingCode] = useState(false);

    const handleSendVerification = async () => {
        setResendMessage(null);
        setSendingLink(true);

        try {
            const res = await fetch("/api/auth/send-verification-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: currentEmail, lang }),
            });

            const data = await res.json();

            if (!res.ok) {
                setResendMessage({
                    type: "error",
                    text: data.message || getErrorMessage(data, dict),
                });
                return;
            }

            setResendMessage({
                type: "success",
                text: s.verificationLinkSent || data.message || "Verification link has been sent to your email address.",
            });
        } catch {
            setResendMessage({
                type: "error",
                text: err.UNKNOWN_ERROR || "Something went wrong. Please try again.",
            });
        } finally {
            setSendingLink(false);
        }
    };

    const handleRequestEmailChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaveMessage(null);
        setSavingEmail(true);

        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail) {
            setSaveMessage({
                type: "error",
                text: dict?.auth?.errors?.emailRequired || "Email is required",
            });
            setSavingEmail(false);
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setSaveMessage({
                type: "error",
                text: dict?.auth?.errors?.emailInvalid || "Please enter a valid email address",
            });
            setSavingEmail(false);
            return;
        }

        try {
            const res = await fetch("/api/user/request-email-change", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newEmail: trimmedEmail, lang }),
            });

            const data = await res.json();

            if (!res.ok) {
                setSaveMessage({
                    type: "error",
                    text: data.message || getErrorMessage(data, dict),
                });
                return;
            }

            if (data.errorCode === "EMAIL_UPDATED_VERIFICATION_SENT") {
                const updatedEmail = data.email || trimmedEmail;
                setCurrentEmail(updatedEmail);
                setEmail(updatedEmail);
                setIsVerified(false);
                setSaveMessage({
                    type: "success",
                    text: s.emailUpdatedVerificationSent || "Email updated. We sent a verification link to your new email.",
                });
                router.refresh();
            } else if (data.errorCode === "EMAIL_CHANGE_CODE_SENT") {
                setShowCodeStep(true);
                setSaveMessage({
                    type: "success",
                    text: s.emailChangeCodeSent || "We sent a confirmation code to your current email.",
                });
            }
        } catch {
            setSaveMessage({
                type: "error",
                text: err.UNKNOWN_ERROR || "Something went wrong. Please try again.",
            });
        } finally {
            setSavingEmail(false);
        }
    };

    const handleConfirmEmailChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaveMessage(null);
        setConfirmingCode(true);

        const trimmedCode = code.trim();

        if (trimmedCode.length !== 6 || !/^\d+$/.test(trimmedCode)) {
            setSaveMessage({
                type: "error",
                text: s.invalidEmailChangeCode || "Please enter a valid 6-digit confirmation code.",
            });
            setConfirmingCode(false);
            return;
        }

        try {
            const res = await fetch("/api/user/confirm-email-change", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: trimmedCode, lang }),
            });

            const data = await res.json();

            if (!res.ok) {
                setSaveMessage({
                    type: "error",
                    text: data.message || getErrorMessage(data, dict),
                });
                return;
            }

            const updatedEmail = data.email || email.trim().toLowerCase();
            setCurrentEmail(updatedEmail);
            setEmail(updatedEmail);
            setIsVerified(false);
            setShowCodeStep(false);
            setCode("");

            setSaveMessage({
                type: "success",
                text: s.emailUpdatedVerificationSent || "Email updated. We sent a verification link to your new email.",
            });

            router.refresh();
        } catch {
            setSaveMessage({
                type: "error",
                text: err.UNKNOWN_ERROR || "Something went wrong. Please try again.",
            });
        } finally {
            setConfirmingCode(false);
        }
    };

    const handleCancelCodeStep = () => {
        setShowCodeStep(false);
        setCode("");
        setSaveMessage(null);
    };

    const isDirty = email.trim().toLowerCase() !== currentEmail.toLowerCase();

    return (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden animate-in fade-in duration-300">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        {s.emailTitle || "Email Settings"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {s.emailDescription || "Manage your email address and verification status."}
                    </p>
                </div>

                {/* Badge status */}
                <div>
                    {isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} />
                            {s.emailVerified || "Verified"}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            <XCircle size={12} />
                            {s.emailNotVerified || "Not verified"}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Status description */}
                <div className="rounded-xl p-4 bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-slate-700">
                            {s.currentEmail || "Current Email Address"}
                        </h4>
                        <p className="text-sm text-slate-600 font-mono break-all">{currentEmail}</p>
                        <p className="text-xs text-slate-400">
                            {isVerified
                                ? (s.emailVerifiedDescription || "Your email is verified.")
                                : (s.emailNotVerifiedDescription || "Your email is not verified yet.")}
                        </p>
                    </div>

                    {!isVerified && (
                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={handleSendVerification}
                                disabled={sendingLink}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {sendingLink ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" />
                                        {s.sendingVerificationLink || "Sending..."}
                                    </>
                                ) : (
                                    <>
                                        <Send size={12} />
                                        {s.sendVerificationLink || "Send verification link"}
                                    </>
                                )}
                            </button>

                            {resendMessage && (
                                <p
                                    className={`text-xs font-medium text-center ${
                                        resendMessage.type === "success" ? "text-emerald-600" : "text-rose-600"
                                    }`}
                                >
                                    {resendMessage.text}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Edit Form */}
                {!showCodeStep ? (
                    <form onSubmit={handleRequestEmailChange} className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="new-email" className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                                <Mail size={14} className="text-slate-400" />
                                {s.newEmail || "New Email Address"}
                            </label>
                            <input
                                id="new-email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (saveMessage) setSaveMessage(null);
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                                placeholder="you@example.com"
                            />
                        </div>

                        {saveMessage && (
                            <div
                                className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                                    saveMessage.type === "success"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                        : "border-rose-200 bg-rose-50 text-rose-800"
                                }`}
                            >
                                {saveMessage.text}
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={savingEmail || !isDirty}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellow-hover text-brand-ink font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 cursor-pointer active:scale-[0.97]"
                            >
                                {savingEmail ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        {isVerified ? (s.sendingCode || "Sending code...") : (s.updatingEmail || "Updating Email...")}
                                    </>
                                ) : (
                                    <>
                                        {isVerified ? <Send size={16} /> : <Save size={16} />}
                                        {isVerified ? (s.sendCode || "Send Code") : (s.updateEmail || "Update Email Address")}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleConfirmEmailChange} className="space-y-4">
                        <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-sm text-blue-800">
                            {s.emailChangeCodeSent || "We sent a 6-digit confirmation code to your current verified email address."}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="confirm-code" className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                                <Key size={14} className="text-slate-400" />
                                {s.emailChangeCode || "Confirmation Code"}
                            </label>
                            <input
                                id="confirm-code"
                                type="text"
                                maxLength={6}
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value.replace(/\D/g, ""));
                                    if (saveMessage) setSaveMessage(null);
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 tracking-[0.2em] font-mono text-center text-lg focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                                placeholder="000000"
                            />
                        </div>

                        {saveMessage && (
                            <div
                                className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                                    saveMessage.type === "success"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                        : "border-rose-200 bg-rose-50 text-rose-800"
                                }`}
                            >
                                {saveMessage.text}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={confirmingCode || code.length !== 6}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellow-hover text-brand-ink font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 cursor-pointer active:scale-[0.97]"
                            >
                                {confirmingCode ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        {s.confirmingEmailChange || "Confirming..."}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={16} />
                                        {s.confirmEmailChange || "Confirm Email Change"}
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleCancelCodeStep}
                                disabled={confirmingCode}
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all cursor-pointer disabled:opacity-40"
                            >
                                {dict?.settings?.cancel || "Cancel / Change new email"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
