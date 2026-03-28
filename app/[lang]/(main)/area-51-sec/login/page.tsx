'use client';

import { loginAction } from "@/app/actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const result = await loginAction(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            // Success! Refresh to let Middleware see the new cookie
            router.refresh();
            router.push("./"); // Go to the dashboard (area-51-sec/)
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Area 51 Access</h1>
                    <p className="text-slate-500 text-sm">Authorized Personnel Only</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Security Cipher (Password)
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-medium text-center italic">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Decrypt & Enter"}
                    </button>
                </form>
            </div>
        </div>
    );
}