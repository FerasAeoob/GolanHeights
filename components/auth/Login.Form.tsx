"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
            className="flex flex-col gap-4 rounded-2xl border border-white/35 bg-white/0.1 backdrop-blur-md p-6 shadow-[0_8px_30px_rgba(0,0,0,0.22)]"
        >
            <div className="flex flex-col">
                <label htmlFor="email" className="text-white">{dict?.signupPage?.email}</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-white/25 text-white   focus:border-white bg-transparent rounded-md p-2"
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="password" className="text-white">{dict?.signupPage?.password}</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-white/25 text-white focus:border-white bg-transparent rounded-md p-2"
                />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="bg-white text-green-700 p-3 rounded cursor-pointer"
            >
                {loading
                    ? dict?.auth?.loggingIn || "Logging in..."
                    : dict?.auth?.login || "Login"}
            </button>
            <p className="text-center text-white mt-4 ">
                {dict?.signupPage?.noAccount} <Link href="/signup" className=" bg-white p-1 rounded text-green-700 underline">{dict?.signupPage?.signup}</Link>
            </p>
        </form>

    );
}