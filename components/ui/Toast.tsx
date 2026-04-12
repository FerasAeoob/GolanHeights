'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: number;
    type: ToastType;
    message: string;
}

let toastId = 0;
let addToastGlobal: ((type: ToastType, message: string) => void) | null = null;

/** Call from anywhere to show a toast */
export function showToast(type: ToastType, message: string) {
    addToastGlobal?.(type, message);
}

const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
};

const colors = {
    success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    error: 'bg-red-500/15 border-red-500/30 text-red-300',
    info: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
};

const iconColors = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    info: 'text-blue-400',
};

export default function ToastContainer() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, type, message }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    useEffect(() => {
        addToastGlobal = addToast;
        return () => {
            addToastGlobal = null;
        };
    }, [addToast]);

    return (
        <div className="fixed inset-x-0 bottom-6 md:inset-x-auto md:end-8 md:bottom-8 z-[200] flex flex-col gap-3 items-center md:items-end pointer-events-none px-4 md:px-0">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setVisible(true));

        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
        }, 4000);

        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const Icon = icons[toast.type];

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[280px] max-w-[420px] transition-all duration-300 ease-out ${colors[toast.type]} ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                }`}
        >
            <Icon size={20} className={`shrink-0 ${iconColors[toast.type]}`} />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
                onClick={() => {
                    setVisible(false);
                    setTimeout(() => onDismiss(toast.id), 300);
                }}
                className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    );
}
