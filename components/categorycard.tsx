import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/categories";

interface CategoryCardProps {
    category: Category;
    lang: string;
    dict: Record<string, any>;
}

export default function CategoryCard({ category, lang, dict }: CategoryCardProps) {
    const Icon = category.icon ? (category.icon) : null;

    // Translated title & description from dictionary
    const title = dict.categories?.[category.slug] ?? category.label ?? category.slug;
    const desc = dict.categoriesDesc?.[category.slug] || "";

    return (
        <Link href={`/${lang}/places?category=${category.slug}`} className="block w-full h-full">
            <div className="group relative h-[12em] sm:h-[15rem] xl:h-[17rem] overflow-hidden rounded-xl shadow-md transition-all duration-500 hover:shadow-2xl">

                <Image
                    src={category.image}
                    alt={title}
                    fill
                    /* 2. Changed 'hover:' to 'group-hover:' so the zoom works through the layers */
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />

                {/* 3. The Dynamic Gradient Layer */}
                {/* Added 'pointer-events-none' so it doesn't block the click/hover of the link */}

                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90 pointer-events-none`} />
                {/* 4. The Content Overlay */}
                <div className="absolute bottom-0 start-0 end-0 p-4 pointer-events-none">
                    {Icon && <Icon className="w-7 h-7 text-white bg-white/20 backdrop-blur-sm rounded-lg p-1 ms-2" />}

                    <h3 className="text-[1.4rem]  font-bold w-fit px-2 py-1 rounded-2xl text-white  ">
                        {title}
                    </h3>
                    <p className="hidden md:block line-clamp-2 ps-2 text-white text-sm">
                        {desc}
                    </p>

                </div>
            </div>
        </Link>
    );
}