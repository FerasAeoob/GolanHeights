import { Bike, TreePine, Utensils, Hotel, Mountain } from "lucide-react";

export const categories = [
  {
    slug: "nature",
    title: "Nature",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1772726185/nature_awchdg.webp",
    color: "from-green-600/90",
    desc: "Scenic trails through volcanic landscapes",
    icon: Mountain,
  },
  {
    slug: "restaurant",
    title: "Restaurants",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1772726185/restaurant_h1uhpc.webp",
    color: "from-orange-600/90",
    desc: "Local cuisine and farm-to-table dining",
    icon: Utensils,
  },
  {
    slug: "activity",
    title: "Activities",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1773740450/SnapInsta.to_574319804_17849997963589560_7374418082728410833_n_o4jgbt.jpg",
    color: "from-red-600/90",
    desc: "ATV, horseback riding, and more",
    icon: Bike,

  },
  {
    slug: "hotel",
    title: "Hotels",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1772726185/hotel_jkef53.webp",
    color: "from-yellow-600/90",
    desc: "Cozy retreats and snowy mountain views",
    icon: Hotel,
  },
  {
    slug: "viewpoint",
    title: "Viewpoints",
    image: "https://res.cloudinary.com/dsjzcazdi/image/upload/v1772726185/view_fmnzxv.webp",
    color: "from-blue-600/90",
    desc: "Panoramic Hermon peaks and Birkat Ram vistas",
    icon: TreePine,
  },
];

export default categories;