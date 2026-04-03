import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
    userId: mongoose.Types.ObjectId;
    placeId: mongoose.Types.ObjectId;
    rating: number;
    text: string;

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
    },
    { timestamps: true }
);

// one user can only review one place once
ReviewSchema.index({ userId: 1, placeId: 1 }, { unique: true });

const Review: Model<IReview> =
    mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;