import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  specialPlacePopupEnabled: boolean;
  specialPlacePopupPlaceId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    specialPlacePopupEnabled: { type: Boolean, default: false },
    specialPlacePopupPlaceId: { type: Schema.Types.ObjectId, ref: "Place", default: null },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
