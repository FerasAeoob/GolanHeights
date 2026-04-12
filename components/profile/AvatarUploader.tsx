'use client';

import { useState, useRef } from 'react';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import { showToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

interface AvatarUploaderProps {
    currentImage?: string;
    name: string;
    email: string;
    dict: Record<string, any>;
}

export default function AvatarUploader({ currentImage, name, email, dict }: AvatarUploaderProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const p = dict?.profile || {};

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // File size check (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showToast('error', 'Image must be under 5MB');
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        // Upload
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await fetch('/api/users/avatar', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                showToast('error', data.message || p?.errorGeneric || 'Upload failed');
                setPreview(null);
                return;
            }

            showToast('success', p?.saved || 'Photo updated!');
            router.refresh();
        } catch {
            showToast('error', p?.errorGeneric || 'Something went wrong');
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        try {
            setUploading(true);
            const res = await fetch('/api/users/avatar', { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) {
                showToast('error', data.message || p?.errorGeneric || 'Failed');
                return;
            }

            setPreview(null);
            showToast('success', p?.removeAvatar || 'Photo removed');
            router.refresh();
        } catch {
            showToast('error', p?.errorGeneric || 'Something went wrong');
        } finally {
            setUploading(false);
        }
    };

    const displayImage = preview || currentImage;

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Avatar display */}
            <div className="relative group">
                <div className="ring-4 ring-emerald-500/20 rounded-full overflow-hidden">
                    <UserAvatar 
                        src={displayImage || undefined} 
                        name={name} 
                        email={email} 
                        size={120} 
                        className="rounded-full shadow-lg"
                    />
                </div>

                {/* Upload overlay */}
                {!uploading && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                        aria-label={p?.changeAvatar || 'Change Photo'}
                    >
                        <Camera size={28} className="text-white drop-shadow-lg" />
                    </button>
                )}

                {/* Loading overlay */}
                {uploading && (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                        <Loader2 size={28} className="text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                    {uploading ? (p?.uploading || 'Uploading...') : (p?.changeAvatar || 'Change Photo')}
                </button>
                {currentImage && !uploading && (
                    <>
                        <span className="text-slate-300">•</span>
                        <button
                            onClick={handleRemove}
                            className="text-xs font-semibold text-red-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <Trash2 size={12} />
                            {p?.removeAvatar || 'Remove'}
                        </button>
                    </>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
}
