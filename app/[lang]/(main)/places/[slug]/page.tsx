import connectDB from "@/lib/mongodb";
import Place from "@/database/place.model";
import { SlugSchema } from "@/database/place.schema";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import PlaceDetails from "@/components/place.sidedetails";

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
        nature: "bg-green-400/90 hover:bg-black/70 text-green-700",
        restaurant: "bg-orange-600/90 hover:bg-black/70 text-orange-900",
        activity: "bg-blue-600/90 hover:bg-black/70 text-blue-900",
        hotel: "bg-indigo-600/90 hover:bg-black/70 text-indigo-900",
        viewpoint: "bg-purple-300/90 hover:bg-black/70 text-purple-900",
    };

    return (
        <div className=" pt-20 flex flex-col w-dvw items-center px-3">
            <div className="flex h-20 w-full max-w-[1200px] items-center ">

                <Link href="/places" className=" flex text-lg font-bold gap-3"><ArrowLeft className="text-lg font-bold mt-1" /> Back to Explore</Link>
            </div>
            <div className="w-full max-w-[1200px] justify-center items-center  ">
                <div className=" max-w-[1200px] md:h-[500px] h-[350px]  relative rounded-3xl overflow-hidden shadow-xl">

                    <Image
                        src={place.images[0].url}
                        alt={place.title.en}



                        className="object-cover "
                        fill
                    />
                </div>

                <div className="flex flex-col lg:flex-row border-box  items-start justify-between pt-10">

                    <div className="lg:max-w-2/3 max-w-full ">
                        <div className="flex flex-col w-fit  ">
                            <div className={` text-sm font-bold px-1.5 shadow-xl w-fit mb-2  ${categoryColors[place.category]}  rounded-md`}>{capitalizeFirst(place.category)}</div>
                            <p className="flex ">
                                <MapPin className="w-4 h-4 mt-1 mr-2" /> {place.location.name}
                            </p>


                        </div>






                        <div className="w-fit  border-box ">

                            <h1 className="text-3xl font-bold mt-6 text-emerald-900 ">
                                {place.title.en}
                            </h1>
                            <div className="h-px w-full bg-gray-400 mt-10" />

                            <div className="mt-5 flex flex-col gap-6 ">
                                {place.description.en.split('\n\n').map((paragraph: string, index: number) => (
                                    <p
                                        key={index}
                                        className="text-gray-600 md:text-xl text-lg leading-relaxed"
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                            </div>



                        </div>
                    </div>
                    <PlaceDetails
                        website={place.contact?.website}
                        phone={place.contact?.phone}
                        open={place.openHours}
                        price={place.price}
                        duration={place.duration}

                        mapLink={`/place/${place.slug}`}
                    />
                </div>

            </div >
        </div >
    );
}