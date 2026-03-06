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
        <Link href={`/categories/${category.slug}`}>
            <div className="">
                <Image
                    src={category.image} // This is the URL from your DB
                    alt={category.title}
                    fill
                    className="object-cover"
                />
                <div className="p-4">
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                </div>
            </div>
        </Link>
    );
}