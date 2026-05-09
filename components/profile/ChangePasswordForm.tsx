'use client';

import { useState, useCallback } from 'react';
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import { getErrorMessage } from "@/utils/error";

interface ChangePasswordFormProps {
    dict: Record<string, any>;
}

export default function ChangePasswordForm({ dict }: ChangePasswordFormProps) {
    const p = dict?.profile || {};

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFieldErrors({});

        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('error', dict?.errors?.FILL_ALL || dict?.auth?.fillAll || 'Please fill all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('error', dict?.errors?.PASSWORDS_DO_NOT_MATCH || p?.passwordMismatch || 'Passwords do not match');
            return;
        }

        try {
            setSaving(true);
            const res = await fetch('/api/users/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                const errorMessage = getErrorMessage(data, dict);
                if (data.field) {
                    setFieldErrors({ [data.field]: errorMessage });
                } else {
                    showToast('error', errorMessage);
                }
                return;
            }

            showToast('success', p?.passwordChanged || 'Password changed!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            showToast('error', dict?.errors?.UNKNOWN_ERROR || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    }, [currentPassword, newPassword, confirmPassword, dict, p]);

    return (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Lock size={18} className="text-slate-400" />
                    {p?.changePassword || 'Change Password'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Current Password */}
                <div className="space-y-1.5">
                    <label htmlFor="current-password" className="text-sm font-semibold text-slate-600">
                        {p?.currentPassword || 'Current Password'}
                    </label>
                    <div className="relative" dir="ltr">
                        <input
                            id="current-password"
                            type={showCurrent ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={`w-full px-4 py-3 pe-12 rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 text-left ${fieldErrors.currentPassword ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-emerald-400'}`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {fieldErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{fieldErrors.currentPassword}</p>}
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                    <label htmlFor="new-password" className="text-sm font-semibold text-slate-600">
                        {p?.newPassword || 'New Password'}
                    </label>
                    <div className="relative" dir="ltr">
                        <input
                            id="new-password"
                            type={showNew ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`w-full px-4 py-3 pe-12 rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 text-left ${fieldErrors.newPassword ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-emerald-400'}`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {fieldErrors.newPassword && <p className="text-red-500 text-sm mt-1">{fieldErrors.newPassword}</p>}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                    <label htmlFor="confirm-new-password" className="text-sm font-semibold text-slate-600">
                        {p?.confirmPassword || 'Confirm New Password'}
                    </label>
                    <div className="relative" dir="ltr">
                        <input
                            id="confirm-new-password"
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full px-4 py-3 pe-12 rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 text-left ${fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-emerald-400'}`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {fieldErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</p>}
                </div>

                {/* Submit */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20 cursor-pointer active:scale-[0.97]"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                {p?.saving || 'Saving...'}
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={16} />
                                {p?.changePassword || 'Change Password'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
