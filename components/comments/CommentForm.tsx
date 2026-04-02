'use client'

import { useState } from "react"
import { useRouter } from "next/navigation";

interface CommentFormProps {
    placeId: String;
    dict: Record<string, any>;
}

export default function CommentForm({ placeId, dict }: CommentFormProps) {
    const router = useRouter();

    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function HandelSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!text.trim()) {
            setError("Please enter a comment");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await fetch("/api/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    placeId,
                    text,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to add comment");
                return;
            }
            setText("");
            router.refresh();

        } catch (error) {
            console.error(error);
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={HandelSubmit} className="flex flex-col gap-3">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={dict.comments.placeholder}
                className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-green-700 min-h-[100px]"
            />

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-fit rounded-xl bg-green-700 px-4 py-2 text-white disabled:opacity-50"
            >
                {loading ? dict.comments.posting : dict.comments.button}
            </button>
        </form>
    );
}