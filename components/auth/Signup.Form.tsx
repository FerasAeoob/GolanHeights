"use client"

import { useState } from "react";
import Link from "next/link";


export default function SignupForm({ lang, dict }: { lang: "ar" | "en" | "he"; dict: any }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        if (!name || !email || !password || !confirmPassword) {
            setError(dict?.signupPage?.fillAll || "Please fill all the fields");
            return;
        }
        if (password !== confirmPassword) {
            setError(dict?.signupPage?.passwordsDoNotMatch || "Passwords do not match");
            return;
        }
        try {
            setLoading(true);
            const res = await fetch("/api/auth/register", {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    phone: phone.trim() || undefined,
                    password,
                })
            })
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Something went wrong");
                return;
            }
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setPhone("");



        } catch (error) {
            setError(dict?.signupPage?.somethingWrong || "Something went wrong");
        } finally {
            setLoading(false);
        }

    }



    return (
        <form className="flex flex-col gap-2 max-w-[400px] mx-auto border border-gray-300 rounded-md p-2" onSubmit={handleSubmit}>
            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}
            <label htmlFor="name">{dict?.signupPage?.name}</label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-md p-2"
            />
            <label htmlFor="phone">{dict?.signupPage?.phone}</label>
            <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border border-gray-300 rounded-md p-2"
            />
            <label htmlFor="email">{dict?.signupPage?.email}</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-md p-2"
            />
            <label htmlFor="password">{dict?.signupPage?.password}</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-md p-2"
            />
            <label htmlFor="confirmPassword">{dict?.signupPage?.confirmPassword}</label>
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-300 rounded-md p-2"
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-green-700 text-white p-3 rounded"
            >
                {loading ? dict?.signupPage?.creatingAccount : dict?.signupPage?.createAccount}
            </button>
            <p className="text-center mt-4">
                {dict?.signupPage?.alreadyHaveAccount} <Link href="/login" className="text-green-700">{dict?.signupPage?.login}</Link>
            </p>
        </form>
    );
}