'use client';

import Link from "next/link";
import Image from "next/image";

interface CategoryCardProps {
    category: {
        slug: string;
        title: string;
        image: string;
    };
}

export default function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Link href={`/categories/${category.slug}`} className="block">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Image
                    src={category.image}
                    alt={category.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                />
                <div className="p-4">
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                </div>
            </div>
        </Link>
    );
}