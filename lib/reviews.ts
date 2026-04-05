import Review from "@/database/review/review.model";
import Place from "@/database/place.model";

export async function updatePlaceRating(placeId: string) {
    const reviews = await Review.find({ placeId });

    const reviewsCount = reviews.length;
    let averageRating = 0;

    if (reviewsCount > 0) {
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        averageRating = total / reviewsCount;
    }

    // 4. update place
    await Place.findByIdAndUpdate(placeId, {
        averageRating,
        reviewsCount,
    });
}