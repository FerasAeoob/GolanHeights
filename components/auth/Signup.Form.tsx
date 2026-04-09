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
        <form className="flex flex-col gap-4 rounded-2xl border border-white/35 bg-white/0.1 backdrop-blur-md p-6 shadow-[0_8px_30px_rgba(0,0,0,0.22)]"
            onSubmit={handleSubmit}>
            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <label htmlFor="name" className="text-white">{dict?.signupPage?.name}</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border border-white/25 text-white focus:border-white bg-transparent rounded-md p-2"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="phone" className="text-white">{dict?.signupPage?.phone}</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border border-white/25 text-white focus:border-white  rounded-md p-2"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="email" className="text-white">{dict?.signupPage?.email}</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-white/25 text-white focus:border-white  rounded-md p-2"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="password" className="text-white">{dict?.signupPage?.password}</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-white/25 text-white focus:border-white  rounded-md p-2"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="confirmPassword" className="text-white">{dict?.signupPage?.confirmPassword}</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border border-white/25 text-white focus:border-white  rounded-md p-2"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-white text-green-700 p-3 rounded cursor-pointer"
                >
                    {loading ? dict?.signupPage?.creatingAccount : dict?.signupPage?.createAccount}
                </button>
                <p className="text-center text-white mt-4 ">
                    {dict?.signupPage?.alreadyHaveAccount} <Link href="/login" className=" bg-white p-1 rounded text-green-700 underline">{dict?.signupPage?.login}</Link>
                </p>
            </div>
        </form>
    );
}