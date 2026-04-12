"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/components/ui/Toast";

interface LoginFormProps {
    lang: "en" | "ar" | "he";
    dict?: any;
}

export default function LoginForm({ lang, dict }: LoginFormProps) {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            showToast('error', dict?.auth?.fillAll || "Please fill all fields");
            return;
        }

        try {
            setLoading(true);

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
                showToast('error', data.message || "Login failed");
                return;
            }

            router.push(`/${lang}`);
            router.refresh();
        } catch {
            showToast('error', dict?.auth?.somethingWrong || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (

        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl justify-center  border border-white/35 bg-white/0.1 backdrop-blur-[3px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.22)] h-[450px]"
        >
            <h1 className="text-xl md:text-3xl font-bold text-white">{dict?.auth?.titleLogin || "Login"}</h1>
            <div className="flex flex-col gap-[2px]">
                <label htmlFor="email" className="text-white">{dict?.auth?.email}</label>
                <input
                    type="email"
                    value={email}
                    placeholder={dict?.auth?.emailPlaceholder}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-white/25 text-white bg-black/5 focus:border-white shadow-inner shadow-white/20 rounded-md p-2"
                />
            </div>
            <div className="flex flex-col gap-[2px]">
                <label htmlFor="password" className="text-white">{dict?.auth?.password}</label>
                <input
                    type="password"
                    value={password}
                    placeholder={dict?.auth?.passwordPlaceholder}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-white/25 text-white bg-black/5  focus:border-white shadow-inner shadow-white/20 rounded-md p-2"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="bg-white shadow-lg shadow-black/80 text-green-700 p-3 rounded cursor-pointer"
            >
                {loading ? dict?.auth?.loggingIn || "Logging in..." : dict?.auth?.login}
            </button>
            <p className="text-center text-white mt-4 ">
                {dict?.auth?.noAccount} <Link href={`/${lang}/signup`} className=" bg-white p-1 rounded text-green-700 underline">{dict?.auth?.createAccount}</Link>
            </p>
        </form>

    );
}