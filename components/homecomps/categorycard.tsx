'use client';

import Link from "next/link";
import Image from "next/image";

interface CategoryCardProps {
    category: {
        slug: string;
        title: string;
        image: string;
        color: string;
    };
}

export default function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Link href={`/categories/${category.slug}`} className="block w-full h-full">
            {/* 1. Added 'group' to the parent container */}
            <div className="group relative h-[12em] sm:h-[15rem] w-full overflow-hidden rounded-xl shadow-sm transition-all duration-300 hover:shadow-xl">

                <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    /* 2. Changed 'hover:' to 'group-hover:' so the zoom works through the layers */
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />

                {/* 3. The Dynamic Gradient Layer */}
                {/* Added 'pointer-events-none' so it doesn't block the click/hover of the link */}
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90 pointer-events-none`} />

                {/* 4. The Content Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
                    <h3 className="text-[1rem] md:text-[1.3rem] font-semibold bg-amber-100/50 backdrop-blur-sm w-fit px-3 py-1 rounded-2xl text-slate-900 transition-colors group-hover:bg-amber-100/80">
                        {category.title}
                    </h3>
                </div>
            </div>
        </Link>
    );
}