"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
    lang: "en" | "ar" | "he";
    dict?: any;
}

export default function LoginForm({ lang, dict }: LoginFormProps) {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setError(dict?.auth?.fillAll || "Please fill all fields");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Login failed");
                return;
            }

            router.push(`/${lang}`);
            router.refresh();
        } catch {
            setError(dict?.auth?.somethingWrong || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                    {dict?.auth?.email || "Email"}
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-green-700"
                    placeholder={dict?.auth?.emailPlaceholder || "Enter your email"}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                    {dict?.auth?.password || "Password"}
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-green-700"
                    placeholder={dict?.auth?.passwordPlaceholder || "Enter your password"}
                />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-green-700 px-4 py-3 text-white disabled:opacity-50"
            >
                {loading
                    ? dict?.auth?.loggingIn || "Logging in..."
                    : dict?.auth?.login || "Login"}
            </button>
        </form>
    );
}