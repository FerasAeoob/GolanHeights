"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Star, Pencil, Trash2 } from "lucide-react";

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
}

interface ReviewsClientProps {
    placeId: string;
    currentUserId?: string;
    currentUserRole?: "user" | "admin" | "business";
    dict?: any;
}

export default function ReviewsClient({
    placeId,
    currentUserId,
    currentUserRole,
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
                if (showLoading) setError(data.message || "Failed to load reviews");
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
            if (showLoading) setError("Something went wrong");
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
        }, 5000);

        return () => clearInterval(interval);
    }, [placeId, currentUserId, isEditing]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!currentUserId) {
            setError("You must be logged in to leave a review");
            return;
        }

        if (!text.trim()) {
            setError("Review cannot be empty");
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
                setError(data.message || "Failed to save review");
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
            setError("Something went wrong");
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
                setError(data.message || "Failed to delete review");
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
            setError("Something went wrong");
        } finally {
            setDeletingReviewId(null);
        }
    }

    function canManageReview(review: ReviewItem) {
        const isOwner = review.userId?._id === currentUserId;
        const isAdmin = currentUserRole === "admin";
        return isOwner || isAdmin;
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

                        <span className="text-sm text-gray-500">
                            {averageRating.toFixed(1)} • {reviews.length}{" "}
                            {dict?.reviews?.count || "reviews"}
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">

                        <p className="text-sm text-gray-400">
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
                            className="rounded-xl bg-green-700 px-4 py-2 text-white disabled:opacity-50"
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
                    <p className="text-gray-500">
                        {dict?.reviews?.loading || "Loading reviews..."}
                    </p>
                ) : orderedReviews.length === 0 ? (
                    <p className="text-gray-500">
                        {dict?.reviews?.empty || "No reviews yet."}
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
                                        {review.userId?.image ? (
                                            <img
                                                src={review.userId.image}
                                                alt={review.userId.name}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gray-200" />
                                        )}

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">
                                                    {review.userId?.name || "Unknown User"}
                                                </p>

                                                {isMine && (
                                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                                        {dict?.reviews?.yourReview || "Your review"}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-500">
                                                {new Date(review.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {canManageReview(review) && (
                                        <div className="flex items-center gap-2">
                                            {isMine && <button
                                                type="button"
                                                onClick={() => {
                                                    if (isMine) {
                                                        startEditReview();
                                                    }
                                                }}
                                                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                {dict?.reviews?.edit || "Edit"}
                                            </button>}

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(review._id)}
                                                disabled={deletingReviewId === review._id}
                                                className="flex items-center gap-1 text-sm text-red-600 hover:underline disabled:opacity-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
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

                                <p className="text-sm leading-6 text-gray-800">{review.text}</p>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}