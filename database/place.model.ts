import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Interface representing the multilingual Place document in MongoDB.
 */
export interface IPlace extends Document {
  title: { en: string; he?: string; ar?: string };
  slug: string;
  description: { en: string; he?: string; ar?: string };
  shortDescription: { en: string; he?: string; ar?: string };

  category: "nature" | "restaurant" | "activity" | "hotel" | "viewpoint";

  image: string;

  location: {
    lat: number;
    lng: number;
    name: string;
  };

  contact?: {
    phone?: string;
    website?: string;
    instagram?: string;
  };

  featured: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const PlaceSchema: Schema = new Schema(
  {
    title: {
      en: { type: String, required: true, trim: true },
      he: { type: String, trim: true },
      ar: { type: String, trim: true },
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    description: {
      en: { type: String, required: true, trim: true },
      he: { type: String, trim: true },
      ar: { type: String, trim: true },
    },

    shortDescription: {
      en: { type: String, required: true, trim: true, maxlength: 255 },
      he: { type: String, trim: true, maxlength: 255 },
      ar: { type: String, trim: true, maxlength: 255 },
    },

    category: {
      type: String,
      required: true,
      enum: ["nature", "restaurant", "activity", "hotel", "viewpoint"],
    },

    image: {
      type: String,
      required: [true, "Image is required"],
      validate: [(v: string) => v.length > 0, "Image cannot be empty"],
    },

    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      name: { type: String, required: true }
    },

    contact: {
      phone: { type: String, trim: true },
      website: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },

    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Pre-validate hook: slug generation from English title
 */
PlaceSchema.pre<IPlace>("validate", function () {
  if (this.isModified("title") || !this.slug) {
    if (this.title.en) {
      this.slug = this.title.en
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
  }

  if (this.location && (isNaN(this.location.lat) || isNaN(this.location.lng))) {
    throw new Error("Invalid latitude or longitude values");
  }
});

/**
 * Export model safely (Next.js HMR)
 */
const Place: Model<IPlace> =
  mongoose.models.Place || mongoose.model<IPlace>("Place", PlaceSchema);

export default Place;