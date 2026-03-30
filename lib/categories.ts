import { Bike, TreePine, Utensils, Hotel, Mountain, type LucideIcon } from "lucide-react";

export interface Category {
  slug: string;
  image: string;
  color: string;
  icon: LucideIcon;
  desc: string;
}

/** Category slugs used as keys in dict.categories and as URL params (always lowercase). */
export const CATEGORY_SLUGS = ["nature", "food & drink", "activities", "stays", "scenic spots"] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const categories: Category[] = [
  {
    slug: "nature",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1772726185/nature_awchdg.webp",
    color: "from-green-600/90",
    desc: "Discover the natural beauty of the Golan Heights, with its stunning landscapes, waterfalls, and hiking trails.",
    icon: Mountain,
  },
  {
    slug: "food & drink",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1774786926/Whisk_910581d212e6d77b0cf4feec58f9e44ddr_tvteyq.jpg",
    color: "from-orange-600/90",
    desc: "Discover the best restaurants and cafes in the Golan Heights, with a variety of cuisines and dining experiences.",
    icon: Utensils,
  },
  {
    slug: "activities",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1773740450/SnapInsta.to_574319804_17849997963589560_7374418082728410833_n_o4jgbt.jpg",
    color: "from-red-600/90",
    desc: "Discover the best activities in the Golan Heights, with a variety of options for all ages and interests.",
    icon: Bike,
  },
  {
    slug: "stays",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1772726185/hotel_jkef53.webp",
    color: "from-yellow-600/90",
    desc: "Discover the best places to stay in the Golan Heights, with a variety of options for all budgets and preferences.",
    icon: Hotel,
  },
  {
    slug: "scenic spots",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1774787693/Whisk_6213f7945e718019a174712d62700d7bdr_ekqzne.webp",
    color: "from-cyan-600/90",
    desc: "Discover the best scenic spots in the Golan Heights, with a variety of viewpoints and natural landscapes.",
    icon: TreePine,
  },
];

export default categories;