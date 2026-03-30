import connectDB from "@/lib/mongodb";
import Place from "@/database/place.model";
import { SlugSchema } from "@/database/place.schema";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import PlaceDetails from "@/components/place.sidedetails";
import { redirect } from "next/navigation"; // Import this!
import { getDictionary } from "@/lib/get-dictionary"; // ADDED
import { notFound } from "next/navigation";
import PhotoGallery from "@/components/PhotoGallery";


interface PageProps {
    params: Promise<{
        slug: string;
        lang: "en" | "he" | "ar";
    }>;
}

export default async function PlacePage({ params }: PageProps) {


    const { slug: rawSlug, lang } = await params;
    const parsedSlug = SlugSchema.safeParse({ slug: decodeURIComponent(rawSlug) });

    if (!parsedSlug.success) {
        return <div>Invalid slug</div>;
    }
    const slug = parsedSlug.data.slug;
    const decodedSlug = decodeURIComponent(slug);

    await connectDB();

    const place = await Place.findOne({
        $or: [
            { "slug.en": decodedSlug },
            { "slug.he": decodedSlug },
            { "slug.ar": decodedSlug },
        ]
    }).lean();

    const dict = await getDictionary(lang); // Fetch dictionary

    if (!place) {
        return notFound();
    }
    const correctSlug = place.slug[lang] || place.slug.en;

    if (decodedSlug !== correctSlug) {
        // If I'm on /he/places/banias-waterfall (English slug)
        // Redirect me to /he/places/מפל-הבניאס (Hebrew slug)
        redirect(`/${lang}/places/${encodeURIComponent(correctSlug)}`);
    }
    function capitalizeFirst(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    const categoryColors: Record<string, string> = {
        nature: "bg-green-200/90 hover:bg-black/70 text-green-700",
        "food & drink": "bg-orange-200/90 hover:bg-black/70 text-orange-700",
        activities: "bg-blue-200/90 hover:bg-black/70 text-blue-700",
        stays: "bg-indigo-200/90 hover:bg-black/70 text-indigo-700",
        "scenic spots": "bg-purple-200/90 hover:bg-black/70 text-purple-700",
    };

    const galleryImages = place.images.map((img: any) => ({
        url: img.url,
        alt: img.alt?.[lang] || img.alt?.en || place.title[lang] || place.title.en || 'Place Image'
    }));

    return (
        <div className=" pt-20 flex flex-col w-dvw items-center px-3">
            <div className="flex h-20 w-full max-w-[1200px] items-center ">

                <Link href={`/${lang}/places`} className=" flex text-lg font-bold gap-3 hover:text-emerald-900 transition-colors duration-300">
                    <ArrowLeft className={`text-lg font-bold mt-1 ${lang === 'he' || lang === 'ar' ? 'rotate-180' : ''}`} />
                    {dict.backtoexplore ?? "Back to Explore"}
                </Link>
            </div>
            <div className="w-full max-w-[1200px] justify-center items-center  ">

                <PhotoGallery images={galleryImages} />

                <div className="flex flex-col lg:flex-row border-box  items-start justify-between pt-10">

                    <div className="lg:max-w-2/3 max-w-full ">
                        <div className="flex flex-col w-fit  ">
                            <div className={` text-sm font-bold px-1.5 shadow-xl w-fit mb-2  ${categoryColors[place.category]}  rounded-md`}>
                                {dict.categories[place.category] || capitalizeFirst(place.category)}
                            </div>
                            <p className="flex gap-2 ">
                                <MapPin className="w-4 h-4 mt-1 " /> {place.location.name[lang] || place.location.name.en}
                            </p>


                        </div>






                        <div className="w-fit  border-box ">

                            <h1 className="text-3xl font-bold mt-6 text-emerald-900 ">
                                {place.title[lang] || place.title.en}
                            </h1>
                            <div className="h-px w-full bg-gray-400 mt-10" />

                            <div className="mt-5 flex flex-col gap-6 ">
                                {(place.description[lang] || place.description.en).split('\n\n').map((paragraph: string, index: number) => (
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
                        openHours={place.openHours || []}
                        open={place.open}
                        price={place.price}
                        duration={place.duration}
                        dict={dict}
                        mapLink={`/${lang}/places/${place.slug[lang] || place.slug.en}`}
                    />
                </div>

            </div >
        </div >
    );
}