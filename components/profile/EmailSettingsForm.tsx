"use client";

import { useState, useCallback } from "react";
import { Mail, CheckCircle2, XCircle, Loader2, Save, Send } from "lucide-react";
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

    const handleUpdateEmail = async (e: React.FormEvent<HTMLFormElement>) => {
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
            const res = await fetch("/api/user/update-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: trimmedEmail, lang }),
            });

            const data = await res.json();

            if (!res.ok) {
                setSaveMessage({
                    type: "error",
                    text: data.message || getErrorMessage(data, dict),
                });
                return;
            }

            if (data.noChange) {
                setSaveMessage({
                    type: "success",
                    text: s.noEmailChange || "This is already your current email address.",
                });
                setSavingEmail(false);
                return;
            }

            // Update local state on successful update
            setCurrentEmail(trimmedEmail);
            setEmail(trimmedEmail);
            setIsVerified(false); // verification required for new email

            setSaveMessage({
                type: "success",
                text: s.emailUpdatedVerificationSent || data.message || "Email updated. We sent a verification link to your new email.",
            });

            router.refresh();
        } catch {
            setSaveMessage({
                type: "error",
                text: err.UNKNOWN_ERROR || "Something went wrong. Please try again.",
            });
        } finally {
            setSavingEmail(false);
        }
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
                <form onSubmit={handleUpdateEmail} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="new-email" className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                            <Mail size={14} className="text-slate-400" />
                            {s.emailAddress || "New Email Address"}
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
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 cursor-pointer active:scale-[0.97]"
                        >
                            {savingEmail ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    {s.updatingEmail || "Updating Email..."}
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    {s.updateEmail || "Update Email Address"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
