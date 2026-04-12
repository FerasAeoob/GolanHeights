'use client';

import { useState, useCallback } from 'react';
import { Save, Loader2, User, Phone } from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

interface EditProfileFormProps {
    user: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    dict: Record<string, any>;
}

export default function EditProfileForm({ user, dict }: EditProfileFormProps) {
    const router = useRouter();
    const p = dict?.profile || {};

    const [name, setName] = useState(user.name || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        setDirty(true);
    }, []);

    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value);
        setDirty(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Client-side validation
        const trimmedName = name.trim();
        if (trimmedName.length < 2 || trimmedName.length > 50) {
            showToast('error', 'Name must be between 2 and 50 characters');
            return;
        }

        const trimmedPhone = phone.trim();
        if (trimmedPhone && !/^\+?[0-9]{10,15}$/.test(trimmedPhone)) {
            showToast('error', 'Invalid phone number');
            return;
        }

        try {
            setSaving(true);

            const body: Record<string, string> = { name: trimmedName };
            if (trimmedPhone) body.phone = trimmedPhone;

            const res = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast('error', data.message || p?.errorGeneric || 'Update failed');
                return;
            }

            showToast('success', p?.saved || 'Profile updated!');
            setDirty(false);
            router.refresh();
        } catch {
            showToast('error', p?.errorGeneric || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">
                    {p?.personalInfo || 'Personal Information'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                    <label htmlFor="profile-name" className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                        <User size={14} className="text-slate-400" />
                        {p?.name || 'Full Name'}
                    </label>
                    <input
                        id="profile-name"
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                        placeholder={p?.name || 'Full Name'}
                    />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-1.5">
                    <label htmlFor="profile-email" className="text-sm font-semibold text-slate-600">
                        {p?.email || 'Email Address'}
                    </label>
                    <input
                        id="profile-email"
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-100/80 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 ps-1">
                        {dict?.lang === 'ar' ? 'لا يمكن تغيير البريد الإلكتروني' : dict?.lang === 'he' ? 'לא ניתן לשנות אימייל' : 'Email cannot be changed'}
                    </p>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                    <label htmlFor="profile-phone" className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                        <Phone size={14} className="text-slate-400" />
                        {p?.phone || 'Phone Number'}
                    </label>
                    <input
                        id="profile-phone"
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                        placeholder="+972..."
                        dir="ltr"
                    />
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={saving || !dirty}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 cursor-pointer active:scale-[0.97]"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                {p?.saving || 'Saving...'}
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                {p?.save || 'Save Changes'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
