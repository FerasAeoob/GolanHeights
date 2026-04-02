import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
    userId: mongoose.Types.ObjectId;
    placeId: mongoose.Types.ObjectId;
    text: string;

    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
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
        text: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 255,
        },
    },
    { timestamps: true }
);

const Comment: Model<IComment> =
    mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;