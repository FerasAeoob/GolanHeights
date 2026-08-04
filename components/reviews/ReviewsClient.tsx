"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Star, Pencil, Trash2 } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

interface ReviewUser {
    _id: string;
    name: string;
    image?: string;
}

interface ReviewItem {
    _id: string;
    userId: ReviewUser;
    placeId: string;
    rating: number;
    text: string;
    createdAt: string;
    updatedAt: string;
    reply?: {
        text: string;
        userId: string;
        createdAt: string;
        isOwnerReply?: boolean;
    } | null;
}

interface ReviewsClientProps {
    placeId: string;
    currentUserId?: string;
    currentUserRole?: "user" | "admin" | "business";
    canReply?: boolean;
    dict?: any;
}

export default function ReviewsClient({
    placeId,
    currentUserId,
    currentUserRole,
    canReply = false,
    dict,
}: ReviewsClientProps) {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [rating, setRating] = useState(5);
    const [text, setText] = useState("");
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [replyingToId, setReplyingToId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [replySubmitting, setReplySubmitting] = useState(false);
    const latestReviewsMarkerRef = useRef<string | null>(null);
    const currentUserReview = useMemo(() => {
        return reviews.find((review) => review.userId?._id === currentUserId);
    }, [reviews, currentUserId]);

    const orderedReviews = useMemo(() => {
        if (!currentUserId) return reviews;

        const mine = reviews.find((review) => review.userId?._id === currentUserId);
        const others = reviews.filter((review) => review.userId?._id !== currentUserId);

        return mine ? [mine, ...others] : reviews;
    }, [reviews, currentUserId]);

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        return total / reviews.length;
    }, [reviews]);

    function buildReviewsMarker(reviewsList: ReviewItem[]) {
        if (reviewsList.length === 0) {
            return "empty";
        }

        const latestUpdatedAt = reviewsList[0]?.updatedAt || reviewsList[0]?.createdAt || "";
        return `${reviewsList.length}-${latestUpdatedAt}`;
    }

    async function fetchReviews(showLoading = false) {
        try {
            if (showLoading) setLoadingReviews(true);

            const res = await fetch(`/api/reviews?placeId=${placeId}`, {
                method: "GET",
                cache: "no-store",
            });

            const data = await res.json();

            if (!res.ok) {
                if (showLoading) setError(dict?.errors?.REVIEW_LOAD_FAILED || "Failed to load reviews");
                return;
            }

            const fetchedReviews: ReviewItem[] = data.reviews || [];
            const newMarker = buildReviewsMarker(fetchedReviews);

            // first load
            if (latestReviewsMarkerRef.current === null) {
                latestReviewsMarkerRef.current = newMarker;
                setReviews(fetchedReviews);

                const mine = fetchedReviews.find(
                    (review) => review.userId?._id === currentUserId
                );

                if (mine) {
                    setRating(mine.rating);
                    setText(mine.text);
                } else {
                    setRating(5);
                    setText("");
                }

                return;
            }

            // update only if changed
            if (newMarker !== latestReviewsMarkerRef.current) {
                latestReviewsMarkerRef.current = newMarker;
                setReviews(fetchedReviews);

                const mine = fetchedReviews.find(
                    (review) => review.userId?._id === currentUserId
                );

                // only sync form automatically if user is NOT editing
                if (!isEditing) {
                    if (mine) {
                        setRating(mine.rating);
                        setText(mine.text);
                    } else {
                        setRating(5);
                        setText("");
                    }
                }
            }
        } catch {
            if (showLoading) setError(dict?.errors?.UNKNOWN_ERROR || "Something went wrong");
        } finally {
            if (showLoading) setLoadingReviews(false);
        }
    }

    useEffect(() => {
        fetchReviews(true);

        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                fetchReviews(false);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [placeId, currentUserId, isEditing]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!currentUserId) {
            setError(dict?.errors?.LOGIN_REQUIRED || "You must be logged in to leave a review");
            return;
        }

        if (!text.trim()) {
            setError(dict?.errors?.REVIEW_EMPTY || "Review cannot be empty");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    placeId,
                    rating,
                    text,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                const code = data.errorCode || "REVIEW_SAVE_FAILED";
                if (code === "UNAUTHORIZED") {
                    setError(dict?.errors?.LOGIN_REQUIRED || "You must be logged in to leave a review");
                } else {
                    setError(dict?.errors?.[code] || dict?.errors?.REVIEW_SAVE_FAILED || "Failed to save review");
                }
                return;
            }

            if (data.review) {
                setReviews((prev) => {
                    const exists = prev.some((r) => r._id === data.review._id);

                    const updatedReviews = exists
                        ? prev.map((r) => (r._id === data.review._id ? data.review : r))
                        : [data.review, ...prev];

                    latestReviewsMarkerRef.current = buildReviewsMarker(updatedReviews);

                    return updatedReviews;
                });
            }

            setIsEditing(false);
        } catch {
            setError(dict?.errors?.UNKNOWN_ERROR || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(reviewId: string) {
        try {
            setDeletingReviewId(reviewId);
            setError("");

            const res = await fetch(`/api/reviews/${reviewId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                const code = data.errorCode || "REVIEW_DELETE_FAILED";
                setError(dict?.errors?.[code] || dict?.errors?.REVIEW_DELETE_FAILED || "Failed to delete review");
                return;
            }

            setReviews((prev) => {
                const updatedReviews = prev.filter((r) => r._id !== reviewId);
                latestReviewsMarkerRef.current = buildReviewsMarker(updatedReviews);
                return updatedReviews;
            });
            setRating(5);
            setText("");
            setIsEditing(false);
        } catch {
            setError(dict?.errors?.UNKNOWN_ERROR || "Something went wrong");
        } finally {
            setDeletingReviewId(null);
        }
    }

    function canManageReview(review: ReviewItem) {
        const isOwner = review.userId?._id === currentUserId;
        const isAdmin = currentUserRole === "admin";
        return isOwner || isAdmin;
    }

    // canReply is passed down from the server page

    async function handleReply(reviewId: string) {
        if (!replyText.trim()) return;
        try {
            setReplySubmitting(true);
            const res = await fetch(`/api/reviews/${reviewId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: replyText.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || data.errorCode || "Failed to post reply");
                return;
            }
            setReviews(prev => prev.map(r =>
                r._id === reviewId ? { ...r, reply: data.reply } : r
            ));
            setReplyingToId(null);
            setReplyText("");
            setError("");
        } catch {
            setError("Something went wrong");
        } finally {
            setReplySubmitting(false);
        }
    }

    async function handleDeleteReply(reviewId: string) {
        try {
            const res = await fetch(`/api/reviews/${reviewId}`, { method: "PATCH" });
            if (!res.ok) {
                const data = await res.json();
                setError(data.message || data.errorCode || "Failed to delete reply");
                return;
            }
            setReviews(prev => prev.map(r =>
                r._id === reviewId ? { ...r, reply: null } : r
            ));
            setError("");
        } catch {
            setError("Something went wrong");
        }
    }

    function startEditReview() {
        if (!currentUserReview) return;

        setRating(currentUserReview.rating);
        setText(currentUserReview.text);
        setIsEditing(true);
        setError("");
    }

    const shouldShowForm = !currentUserReview || isEditing;

    return (
        <section className="mt-10 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold">
                    {dict?.reviews?.title || "Reviews"}
                </h2>

                {reviews.length > 0 ? (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= Math.round(averageRating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                        }`}
                                />
                            ))}
                        </div>

                        <span className="text-sm text-gray-600">
                            {averageRating.toFixed(1)} • {reviews.length}{" "}
                            {dict?.reviews?.count || "reviews"}
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">

                        <p className="text-sm text-gray-500">
                            {dict?.reviews?.firstReview || "Be the first to review this place."}
                        </p>
                    </div>
                )}
            </div>

            {shouldShowForm && (
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4"
                >
                    <p className="font-medium">
                        {currentUserReview
                            ? dict?.reviews?.editTitle || "Edit your review"
                            : dict?.reviews?.writeTitle || "Write a review"}
                    </p>

                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const isActive = star <= rating;

                            return (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    aria-label={`${dict?.reviews?.rateStar || 'Rate'} ${star} ${star === 1 ? (dict?.reviews?.star || 'star') : (dict?.reviews?.stars || 'stars')}`}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-6 w-6 ${isActive
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                            }`}
                                    />
                                </button>
                            );
                        })}
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={dict?.reviews?.placeholder || "Write your review..."}
                        className="min-h-[120px] w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-green-700"
                    />

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-xl bg-brand-yellow px-4 py-2 text-brand-ink disabled:opacity-50"
                        >
                            {submitting
                                ? dict?.reviews?.saving || "Saving..."
                                : currentUserReview
                                    ? dict?.reviews?.updateButton || "Update Review"
                                    : dict?.reviews?.submitButton || "Post Review"}
                        </button>

                        {currentUserReview && isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setRating(currentUserReview.rating);
                                    setText(currentUserReview.text);
                                    setError("");
                                }}
                                className="rounded-xl border border-gray-300 px-4 py-2"
                            >
                                {dict?.reviews?.cancelButton || "Cancel"}
                            </button>
                        )}
                    </div>
                </form>
            )}

            <div className="flex flex-col gap-4">
                {loadingReviews ? (
                    <p className="text-gray-600">
                        {dict?.reviews?.loading || "Loading reviews..."}
                    </p>


                ) : (
                    orderedReviews.map((review) => {
                        const isMine = review.userId?._id === currentUserId;

                        return (
                            <div
                                key={review._id}
                                className={`rounded-2xl border p-4 shadow-sm ${isMine ? "border-green-300 bg-green-50/40" : "border-gray-200"
                                    }`}
                            >
                                <div className="mb-2 flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar
                                            src={review.userId?.image}
                                            name={review.userId?.name}
                                            size={40}
                                        />

                                        <div className="flex flex-col gap-1">
                                            <div className="flex flex-row gap-1">
                                                <div className="flex items-center justify-center w-fit">


                                                    <p className="text-m w-fit">
                                                        {review.userId?.name || "Unknown User"}
                                                    </p>
                                                </div>
                                                <div className="flex-1 flex items-center justify-center">


                                                    {isMine && (
                                                        <span className="rounded-md text-center bg-green-100 px-2 py-0.5 sm:gap-1 text-xs text-green-700 ">
                                                            {dict?.reviews?.yourReview || "Your review"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>


                                            <p className="text-xs text-gray-600">
                                                {new Date(review.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {canManageReview(review) && (
                                        <div className="flex items-start flex-col sm:flex-row gap-2 sm:gap-4">
                                            {isMine && <button
                                                type="button"
                                                onClick={() => {
                                                    if (isMine) {
                                                        startEditReview();
                                                    }
                                                }}
                                                className="flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:underline"
                                            >
                                                <Pencil className="flex-1 h-4 w-4 sm:me-0" />
                                                {dict?.reviews?.edit || "Edit"}
                                            </button>}

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(review._id)}
                                                disabled={deletingReviewId === review._id}
                                                className="flex items-center gap-1 text-xs md:text-sm text-red-600 hover:underline disabled:opacity-50"
                                            >
                                                <Trash2 className="flex-1 h-4 w-4" />
                                                {dict?.reviews?.deleteButton || "Delete"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-2 flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-4 w-4 ${star <= review.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                                }`}
                                        />
                                    ))}
                                </div>

                                <p className="text-sm leading-6 text-gray-800 break-words whitespace-pre-wrap">{review.text}</p>

                                {/* ─── Reply block ─── */}
                                {review.reply && (
                                    <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-semibold text-emerald-700">
                                                {review.reply.isOwnerReply
                                                    ? (dict?.reviews?.ownerReply || "Owner Reply")
                                                    : (dict?.reviews?.adminReply || "Admin Reply")}
                                            </p>
                                            {review.reply.userId === currentUserId && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteReply(review._id)}
                                                    className="flex items-center gap-1 text-xs text-red-500 hover:underline"
                                                >
                                                    <Trash2 className="w-3 h-3" /> {dict?.reviews?.deleteReply || "Delete"}
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-800 leading-6 break-words whitespace-pre-wrap">{review.reply.text}</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(review.reply.createdAt).toLocaleString()}</p>
                                    </div>
                                )}

                                {/* ─── Reply input (eligible users only) ─── */}
                                {canReply && (!review.reply || review.reply.userId === currentUserId) && (
                                    replyingToId === review._id ? (
                                        <div className="mt-3 flex flex-col gap-2">
                                            <textarea
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                placeholder={dict?.reviews?.replyPlaceholder || "Write your reply..."}
                                                className="w-full rounded-xl border border-emerald-300 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600 min-h-[80px]"
                                            />
                                            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleReply(review._id)}
                                                    disabled={replySubmitting}
                                                    className="rounded-xl bg-emerald-700 px-4 py-1.5 text-sm text-white disabled:opacity-50"
                                                >
                                                    {replySubmitting
                                                        ? (dict?.reviews?.savingReply || "Saving...")
                                                        : review.reply
                                                            ? (dict?.reviews?.updateReply || "Update Reply")
                                                            : (dict?.reviews?.postReply || "Post Reply")}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setReplyingToId(null); setReplyText(""); setError(""); }}
                                                    className="rounded-xl border border-gray-300 px-4 py-1.5 text-sm"
                                                >
                                                    {dict?.reviews?.cancelButton || "Cancel"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => { setReplyingToId(review._id); setReplyText(review.reply?.text || ""); setError(""); }}
                                            className="mt-2 text-xs text-emerald-700 hover:underline font-medium"
                                        >
                                            {review.reply
                                                ? (dict?.reviews?.editReply || "Edit Reply")
                                                : (dict?.reviews?.reply || "Reply")}
                                        </button>
                                    )
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </section >
    );
}
