import { Bike, TreePine, Utensils, Hotel, Mountain, type LucideIcon } from "lucide-react";

export interface Category {
  slug: string;
  label: string;
  image: string;
  color: string;
  icon: LucideIcon;
  desc?: string;
}

/** Category slugs used as keys in dict.categories and as URL params (always lowercase, kebab-case). */
export const CATEGORY_SLUGS = ["nature", "food-drink", "activities", "stays", "scenic-spots"] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const categories: Category[] = [
  {
    slug: "nature",
    label: "Nature",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1772726185/nature_awchdg.webp",
    color: "from-green-600/90",
    desc: "Discover the natural beauty of the Golan Heights, with its stunning landscapes, waterfalls, and hiking trails.",
    icon: Mountain,
  },
  {
    slug: "food-drink",
    label: "Food & Drink",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1774786926/Whisk_910581d212e6d77b0cf4feec58f9e44ddr_tvteyq.jpg",
    color: "from-orange-600/90",
    icon: Utensils,
  },
  {
    slug: "activities",
    label: "Activities",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1773740450/SnapInsta.to_574319804_17849997963589560_7374418082728410833_n_o4jgbt.jpg",
    color: "from-red-600/90",
    icon: Bike,
  },
  {
    slug: "stays",
    label: "Stays",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1772726185/hotel_jkef53.webp",
    color: "from-yellow-600/90",
    icon: Hotel,
  },
  {
    slug: "scenic-spots",
    label: "Scenic Spots",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1774787693/Whisk_6213f7945e718019a174712d62700d7bdr_ekqzne.webp",
    color: "from-cyan-600/90",
    icon: TreePine,
  },
];

export default categories;