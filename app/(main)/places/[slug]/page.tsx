import  connectDB  from "@/lib/mongodb";
import Place from "@/database/place.model";
import {SlugSchema} from "@/schemas/place.schema";
import Image from "next/image";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function PlacePage({ params }: PageProps) {


    const { slug: rawSlug } = await params;
    const parsedSlug = SlugSchema.safeParse({ slug: rawSlug });

    if (!parsedSlug.success) {
        return <div>Invalid slug</div>;
    }
    const slug = parsedSlug.data.slug;

    await connectDB();

    const place = await Place.findOne({ slug: slug }).lean();

    if (!place) {
        return <div>Place not found</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <Image
                src={place.image}
                alt={place.title.en}
                width={1200}
                height={600}
                className="rounded-xl object-cover"
            />

            <h1 className="text-3xl font-bold mt-6">
                {place.title.en}
            </h1>

            <p className="mt-3 text-gray-600">
                {place.description.en}
            </p>

            <p className="mt-4">
                📍 {place.location.name}
            </p>
        </div>
    );
}