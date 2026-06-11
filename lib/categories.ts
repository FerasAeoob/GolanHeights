import { Bike, ShoppingBag, Church, Utensils, Hotel, Mountain, Wrench, type LucideIcon } from "lucide-react";

export interface Category {
  slug: string;
  label: string;
  image: string;
  color: string;
  icon: LucideIcon;
  desc?: string;
}

/** Category slugs used as keys in dict.categories and as URL params (always lowercase, kebab-case). */
export const CATEGORY_SLUGS = ["nature", "food-drink", "activities", "stays", "holy-places", "shopping", "local-services"] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const categories: Category[] = [
  {
    slug: "nature",
    label: "Nature",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1780908782/Transform_this_landscape_photo_into_202606081152_clwqcl.webp",
    color: "from-green-600/90",
    desc: "Discover the natural beauty of the Golan Heights, with its stunning landscapes, waterfalls, and hiking trails.",
    icon: Mountain,
  },
  {
    slug: "food-drink",
    label: "Food & Drink",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/f_auto,q_auto/v1774786926/Whisk_910581d212e6d77b0cf4feec58f9e44ddr_tvteyq.jpg",
    color: "from-orange-600/90",
    icon: Utensils,
  },
  {
    slug: "activities",
    label: "Activities",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/f_auto,q_auto/v1773740450/SnapInsta.to_574319804_17849997963589560_7374418082728410833_n_o4jgbt.jpg",
    color: "from-red-600/90",
    icon: Bike,
  },
  {
    slug: "stays",
    label: "Stays",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/f_auto,q_auto/v1772726185/hotel_jkef53.webp",
    color: "from-yellow-600/90",
    icon: Hotel,
  },
  {
    slug: "holy-places",
    label: "Holy Places",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1780243698/Edit_this_image_to_make_202605311906_fp1e2f.webp",
    color: "from-amber-600/90",
    icon: Church,
  },
  {
    slug: "shopping",
    label: "Shopping",
    image: "/images/shopping.png",
    color: "from-pink-600/90",
    icon: ShoppingBag,
  },
  {
    slug: "local-services",
    label: "Local Services",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1780244433/Create_a_premium_category_image_202605311920_cpc78s.webp", // Fallback image
    color: "from-blue-600/90",
    icon: Wrench,
  },
];

export default categories;