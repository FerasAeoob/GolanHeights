import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Interface representing the multilingual Place document in MongoDB.
 */
export interface IPlaceBase {
  title: { en: string; he?: string; ar?: string };
  slug: { en: string; he?: string; ar?: string };
  description: { en: string; he?: string; ar?: string };
  shortDescription: { en: string; he?: string; ar?: string };
  price: string;
  duration: string;
  rating?: string;
  open: string;
  category: "nature" | "restaurant" | "activity" | "hotel" | "viewpoint";
  mapLink: string;

  images: {
    url: string;
    alt: {
      en: string;
      he?: string;
      ar?: string;
    };
  }[];


  location: {
    lat: number;
    lng: number;
    name: { en: string; he: string; ar: string };
  };

  contact?: {
    phone?: string;
    website?: string;
    instagram?: string;
  };

  featured: boolean;
}

export interface IPlace extends Document, IPlaceBase {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface representing a plain JS object (Serializable) for a Place.
 */
export interface IPlaceSerializable extends IPlaceBase {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

const PlaceSchema: Schema = new Schema(
  {
    title: {
      en: { type: String, required: true, trim: true },
      he: { type: String, trim: true },
      ar: { type: String, trim: true },
    },

    slug: {
      en: { type: String, required: true, unique: true, index: true },
      he: { type: String, sparse: true }, // sparse allows unique nulls if needed
      ar: { type: String, sparse: true },
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

    images: {
      type: [
        {
          url: { type: String, required: true },
          alt: {
            en: { type: String, required: true },
            he: { type: String },
            ar: { type: String },
          },
        },
      ],

      validate: [(v: any[]) => v.length > 0, "Please add at least one image"],
    },

    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      name: {
        en: { type: String, required: true },
        he: { type: String, required: true },
        ar: { type: String, required: true },
      }
    },

    contact: {
      phone: { type: String, trim: true },
      website: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
    open: { type: String, trim: true },
    rating: { type: String, trim: true },
    duration: { type: String, trim: true },
    price: { type: String, trim: true },
    mapLink: { type: String, trim: true },

    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Pre-validate hook: slug generation from English title
 */
const slugifyMultilingual = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, "-")
    // Remove characters that break URLs (keep letters in all languages, numbers, and hyphens)
    // This regex [^\p{L}\p{N}-] uses Unicode property escapes
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    // Remove consecutive hyphens
    .replace(/-+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "");
};
PlaceSchema.pre<IPlace>("validate", async function () {
  // 1. Initialize slug object if missing
  if (!this.slug) {
    this.slug = { en: "", he: "", ar: "" };
  }

  // 2. Generate/update slugs
  if (this.isModified("title")) {
    this.slug.en = slugifyMultilingual(this.title.en || "");
    this.slug.he = this.title.he ? slugifyMultilingual(this.title.he) : this.slug.en;
    this.slug.ar = this.title.ar ? slugifyMultilingual(this.title.ar) : this.slug.en;
  }

  // 3. Location Validation
  if (this.location && (isNaN(this.location.lat) || isNaN(this.location.lng))) {
    // Instead of next(error), just throw the error
    throw new Error("Invalid latitude or longitude values");
  }

  // No need to call next() here!
});

/**
 * Export model safely (Next.js HMR)
 */
const Place: Model<IPlace> =
  mongoose.models.Place || mongoose.model<IPlace>("Place", PlaceSchema);

export default Place;