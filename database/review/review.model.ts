import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReviewReply {
    text: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
}

export interface IReview extends Document {
    userId: mongoose.Types.ObjectId;
    placeId: mongoose.Types.ObjectId;
    rating: number;
    text: string;
    reply?: IReviewReply | null;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        placeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Place",
            required: true,
            index: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        text: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 1000,
        },

        /**
         * Owner/Admin reply — NOT a review; never counted in ratings.
         * Overwrite strategy: only one reply per review (admin can update it).
         */
        reply: {
            type: {
                text:      { type: String, required: true, trim: true, maxlength: 2000 },
                userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
                createdAt: { type: Date, default: Date.now },
            },
            default: null,
        },
    },
    { timestamps: true }
);

// one user can only review one place once
ReviewSchema.index({ userId: 1, placeId: 1 }, { unique: true });

// Next.js HMR guard: clear cached model if reply path is missing
if (mongoose.models.Review && !mongoose.models.Review.schema.paths['reply']) {
    delete mongoose.models.Review;
}

const Review: Model<IReview> =
    mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;