import { Bike, TreePine, Utensils, Hotel, Mountain, type LucideIcon } from "lucide-react";

export interface Category {
    slug: string;
    image: string;
    color: string;
    icon: LucideIcon;
}

/** Category slugs used as keys in dict.categories and as URL params (always lowercase). */
export const CATEGORY_SLUGS = ["nature", "restaurant", "activity", "hotel", "viewpoint"] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const categories: Category[] = [
  {
    slug: "nature",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1772726185/nature_awchdg.webp",
    color: "from-green-600/90",
    icon: Mountain,
  },
  {
    slug: "restaurant",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1772726185/restaurant_h1uhpc.webp",
    color: "from-orange-600/90",
    icon: Utensils,
  },
  {
    slug: "activity",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1773740450/SnapInsta.to_574319804_17849997963589560_7374418082728410833_n_o4jgbt.jpg",
    color: "from-red-600/90",
    icon: Bike,
  },
  {
    slug: "hotel",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1772726185/hotel_jkef53.webp",
    color: "from-yellow-600/90",
    icon: Hotel,
  },
  {
    slug: "viewpoint",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1772726185/view_fmnzxv.webp",
    color: "from-blue-600/90",
    icon: TreePine,
  },
];

export default categories;