import connectDB from "@/lib/mongodb";
import Place from "@/database/place.model";
import { SlugSchema } from "@/schemas/place.schema";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

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
    function capitalizeFirst(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    const categoryColors: Record<string, string> = {
        nature: "bg-green-400 hover:bg-black/70 text-green-700",
        restaurant: "bg-orange-900/80",
        activity: "bg-blue-900/80 hover:bg-black-900/40",
        hotel: "bg-indigo-900/80",
        viewpoint: "bg-purple-900/80",
    };

    return (
        <div className=" pt-20 flex flex-col w-dvw h-full items-center px-3">
            <div className="flex h-20 w-full max-w-[1200px] items-center ">

                <Link href="/places" className=" flex text-lg font-bold gap-3"><ArrowLeft className="text-lg font-bold mt-1" /> Back to Explore</Link>
            </div>
            <div className="w-full max-w-[1200px] justify-center items-center ">
                <div className=" max-w-[1200px] md:h-[500px] h-[350px]  relative rounded-3xl overflow-hidden shadow-xl">

                    <Image
                        src={place.image}
                        alt={place.title.en}



                        className="object-cover "
                        fill
                    />
                </div>
                <div className="flex flex-col mt-10 w-fit  ">
                    <div className={` text-sm font-bold px-1.5 shadow-xl w-fit mb-2  ${categoryColors[place.category]}  rounded-md`}>{capitalizeFirst(place.category)}</div>
                    <p className="flex">
                        <MapPin className="w-4 h-4 mt-1 mr-2" /> {place.location.name}
                    </p>


                </div>



                <div className="flex border-box border-black border-2">


                    <div className="w-fit  border-box ">

                        <h1 className="text-3xl font-bold mt-6">
                            {place.title.en}
                        </h1>

                        <div className="mt-5 flex flex-col gap-6 pr-10">
                            {place.description.en.split('\n\n').map((paragraph: string, index: number) => (
                                <p
                                    key={index}
                                    className="text-gray-600 text-xl leading-relaxed"
                                >
                                    {paragraph}
                                </p>
                            ))}
                        </div>



                    </div>
                    <aside className="w-70 border-box border-black border-2 max-h-80 p-5">
                        <div>
                            <h1 className="text-xl font-bold">Details</h1>
                            <p>Location: {place.location.name}</p>
                            <p>Category: {place.category}</p>
                            <p>Price: {place.price}</p>

                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}