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
            setError(dict?.auth?.fillAll || "Please fill all the fields");
            return;
        }
        if (password !== confirmPassword) {
            setError(dict?.auth?.passwordsDoNotMatch || "Passwords do not match");
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
            setError(dict?.auth?.somethingWrong || "Something went wrong");
        } finally {
            setLoading(false);
        }

    }



    return (
        <form className="flex flex-col gap-4 rounded-2xl border border-white/35 bg-white/0.1 backdrop-blur-[3px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.22)]"
            onSubmit={handleSubmit}>

            <h1 className="text-3xl font-bold text-white">{dict?.auth?.titleSignup || "Create Account"}</h1>

            <div className="flex flex-col gap-4 ">
                <div className="flex flex-col gap-[2px]">
                    <label htmlFor="name" className="text-white">{dict?.auth?.name}</label>
                    <input
                        type="text"
                        value={name}
                        placeholder={dict?.auth?.required}
                        onChange={(e) => setName(e.target.value)}
                        className="border border-white/25 bg-black/5 text-white focus:border-white shadow-inner shadow-white/20 rounded-md p-2"
                    />
                </div>
                <div className="flex flex-col gap-[2px]">
                    <label htmlFor="phone" className="text-white">{dict?.auth?.phone}</label>
                    <input
                        type="text"
                        value={phone}
                        placeholder={dict?.auth?.optional}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border border-white/25 bg-black/5 text-white focus:border-white shadow-inner shadow-white/20 rounded-md p-2"
                    />
                </div>
                <div className="flex flex-col gap-[2px]">
                    <label htmlFor="email" className="text-white">{dict?.auth?.email}</label>
                    <input
                        type="email"
                        value={email}
                        placeholder={dict?.auth?.required}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-white/25 bg-black/5 text-white focus:border-white shadow-inner shadow-white/20 rounded-md p-2"
                    />
                </div>
                <div className="flex flex-col gap-[2px]">
                    <label htmlFor="password" className="text-white">{dict?.auth?.password}</label>
                    <input
                        type="password"
                        value={password}
                        placeholder={dict?.auth?.required}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-white/25 bg-black/5 text-white focus:border-white shadow-inner shadow-white/20 rounded-md p-2"
                    />
                </div>
                <div className="flex flex-col gap-[2px]">
                    <label htmlFor="confirmPassword" className="text-white">{dict?.auth?.confirmPassword}</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        placeholder={dict?.auth?.required}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border border-white/25 bg-black/5 text-white focus:border-white shadow-inner shadow-white/20 rounded-md p-2"
                    />
                </div>
                {error && (
                    <p className="text-red-200 w-fit text-md mx-auto">{error}!</p>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-white text-green-700 p-3 rounded cursor-pointer"
                >
                    {loading ? dict?.auth?.creatingAccount : dict?.auth?.createAccount}
                </button>
                <p className="text-center text-white mt-4 ">
                    {dict?.auth?.alreadyHaveAccount} <Link href={`/${lang}/login`} className=" bg-white p-1 rounded text-green-700 underline">{dict?.auth?.login}</Link>
                </p>
            </div>
        </form>
    );
}