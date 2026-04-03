"use client";

import { useEffect, useRef, useState } from "react";

interface CommentUser {
    _id: string;
    name: string;
    image?: string;
}

interface CommentItem {
    _id: string;
    userId: CommentUser;
    text: string;
    createdAt: string;
}

interface CommentsClientProps {
    placeId: string;
    dict?: any;
    currentUserId?: string;
    currentUserRole?: "user" | "admin" | "business";
}

export default function CommentsClient({
    placeId,
    dict,
    currentUserId,
    currentUserRole,

}: CommentsClientProps) {
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [text, setText] = useState("");
    const [loadingComments, setLoadingComments] = useState(true);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const latestCommentIdRef = useRef<string | null>(null);

    async function fetchComments(showLoading = false) {
        try {
            if (showLoading) {
                setLoadingComments(true);
            }

            const res = await fetch(`/api/comments?placeId=${placeId}`, {
                method: "GET",
                cache: "no-store",
            });

            const data = await res.json();

            if (!res.ok) {
                if (showLoading) {
                    setError(data.message || "Failed to load comments");
                }
                return;
            }

            const newComments: CommentItem[] = data.comments || [];
            const newestId = newComments[0]?._id || null;

            // First load
            if (latestCommentIdRef.current === null) {
                latestCommentIdRef.current = newestId;
                setComments(newComments);
                return;
            }

            // Only update UI if top/latest comment changed
            if (newestId !== latestCommentIdRef.current) {
                latestCommentIdRef.current = newestId;
                setComments(newComments);
            }
        } catch {
            if (showLoading) {
                setError("Something went wrong");
            }
        } finally {
            if (showLoading) {
                setLoadingComments(false);
            }
        }
    }

    useEffect(() => {
        fetchComments(true);

        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                fetchComments(false);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [placeId]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!text.trim()) {
            setError("Comment cannot be empty");
            return;
        }

        try {
            setPosting(true);
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
                setError(data.message || "Failed to post comment");
                return;
            }

            if (data.comment) {
                setComments((prev) => [data.comment, ...prev]);
                latestCommentIdRef.current = data.comment._id;
            }

            setText("");
        } catch {
            setError("Something went wrong");
        } finally {
            setPosting(false);
        }
    }
    function canManageComment(comment: CommentItem) {
        const isOwner = comment.userId?._id === currentUserId;
        const isAdmin = currentUserRole === "admin";

        return isOwner || isAdmin;
    }
    async function handleEdit(commentId: string) {
        if (!editText.trim()) {
            setError("Comment cannot be empty");
            return;
        }

        try {
            setActionLoadingId(commentId);
            setError("");

            const res = await fetch(`/api/comments/${commentId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: editText,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to update comment");
                return;
            }

            if (data.comment) {
                setComments((prev) =>
                    prev.map((comment) =>
                        comment._id === commentId ? data.comment : comment
                    )
                );
            }

            setEditingCommentId(null);
            setEditText("");
        } catch {
            setError("Something went wrong");
        } finally {
            setActionLoadingId(null);
        }
    }
    async function handleDelete(commentId: string) {
        try {
            setActionLoadingId(commentId);
            setError("");

            const res = await fetch(`/api/comments/${commentId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to delete comment");
                return;
            }

            setComments((prev) =>
                prev.filter((comment) => comment._id !== commentId)
            );

            if (editingCommentId === commentId) {
                setEditingCommentId(null);
                setEditText("");
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setActionLoadingId(null);
        }
    }


    return (
        <section className="mt-10 flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-semibold">
                    {dict?.comments?.title || "Comments"}
                </h2>
                <p className="text-sm text-gray-500">
                    {dict?.comments?.subtitle || "Share your thoughts about this place."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={dict?.comments?.placeholder || "Write a comment..."}
                    className="min-h-[100px] w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-green-700"
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={posting}
                    className="w-fit rounded-xl bg-green-700 px-4 py-2 text-white disabled:opacity-50"
                >
                    {posting
                        ? dict?.comments?.posting || "Posting..."
                        : dict?.comments?.button || "Post Comment"}
                </button>
            </form>

            <div className="flex flex-col gap-4">
                {loadingComments ? (
                    <p className="text-gray-500">
                        {dict?.comments?.loading || "Loading comments..."}
                    </p>
                ) : comments.length === 0 ? (
                    <p className="text-gray-500">
                        {dict?.comments?.empty || "No comments yet."}
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment._id}
                            className="rounded-2xl border border-gray-200 p-4 shadow-sm"
                        >
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    {comment.userId?.image ? (
                                        <img
                                            src={comment.userId.image}
                                            alt={comment.userId.name}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                                    )}

                                    <div>
                                        <p className="font-medium">
                                            {comment.userId?.name || "Unknown User"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {canManageComment(comment) && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingCommentId(comment._id);
                                                setEditText(comment.text);
                                            }}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(comment._id)}
                                            disabled={actionLoadingId === comment._id}
                                            className="text-sm text-red-600 hover:underline disabled:opacity-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>

                            {editingCommentId === comment._id ? (
                                <div className="flex flex-col gap-3">
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="min-h-[90px] w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-green-700"
                                    />

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(comment._id)}
                                            disabled={actionLoadingId === comment._id}
                                            className="rounded-xl bg-green-700 px-4 py-2 text-white disabled:opacity-50"
                                        >
                                            Save
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingCommentId(null);
                                                setEditText("");
                                            }}
                                            className="rounded-xl border border-gray-300 px-4 py-2"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm leading-6 text-gray-800">{comment.text}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}