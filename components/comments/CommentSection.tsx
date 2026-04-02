import CommentForm from "./CommentForm";

interface CommentsSectionProps {
    placeId: string;
    dict: Record<string, any>;
}

async function getComments(placeId: string) {
    const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/comments?placeId=${placeId}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        return [];
    }

    const data = await res.json();
    return data.comments || [];
}

export default async function CommentsSection({
    placeId,
    dict,
}: CommentsSectionProps) {
    const comments = await getComments(placeId);

    return (
        <section className="flex flex-col gap-6 mt-10">
            <div>
                <h2 className="text-2xl font-semibold">{dict.comments.title}</h2>
                <p className="text-sm text-gray-500">
                    {dict.comments.description}
                </p>
            </div>

            <CommentForm placeId={placeId} dict={dict} />

            <div className="flex flex-col gap-4">
                {comments.length === 0 ? (
                    <p className="text-gray-500">{dict.comments.empty}</p>
                ) : (
                    comments.map((comment: any) => (
                        <div
                            key={comment._id}
                            className="rounded-2xl border border-gray-200 p-4 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-2">
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

                            <p className="text-sm leading-6 text-gray-800">
                                {comment.text}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}