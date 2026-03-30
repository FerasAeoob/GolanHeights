import "@/app/globals.css";
import CategoryCard from "@/components/categorycard";
import categories from "@/lib/categories"; // Ensure this is the array
import AnimatedHero from "@/components/animatedHero";
import PlaceCard from "@/components/placecard";
import Place, { IPlace, IPlaceSerializable } from "@/database/place.model"; // 🟢 1. Added IPlace import here
import { getDictionary } from "@/lib/get-dictionary";

import connectDB from "@/lib/mongodb";

export default async function HomePage({ params }: { params: { lang: 'en' | 'ar' | 'he' } }) {
    await connectDB();
    const { lang } = await params;
    const dict = await getDictionary(lang);

    // 🟢 FIX 1: Removed { featured: true } so it fetches EVERYTHING in your database
    const rawPlaces = await Place.find({ featured: true }).limit(6).lean();

    ;

    // 🟢 FIX 2: Added 'any' (or you can use 'IPlace') so ESLint doesn't complain
    const places: IPlaceSerializable[] = rawPlaces.map((place: IPlace) => ({
        ...place,
        _id: String(place._id),
        createdAt: place.createdAt ? String(place.createdAt) : undefined,
        updatedAt: place.updatedAt ? String(place.updatedAt) : undefined,
    }));

    return (
        <main className="min-h-screen w-dvw">
            {/* Hero Section */}
            <section className="pb-10 w-full">
                <AnimatedHero lang={lang} dict={dict} />
            </section>

            {/* Categories Section */}
            <section className="flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-3 w-full max-w-[1200px] lg:max-w-[1400px] px-4  ">

                    <div className="flex flex-col items-center justify-center w-[85%] gap-3">
                        <h3 className="text-green-900 font-medium uppercase tracking-widest text-lg text-center">
                            {dict.discover}
                        </h3>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900  text-center">
                            {dict.explorebycategory}
                        </h2>
                        <p className="relative text-lg md:text-xl text-center">
                            {dict.explorebycategorydescription}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center w-full box-border gap-3">
                        {categories.map((cat) => (
                            <div
                                key={cat.slug}
                                className="w-[calc((100%-12px)/2)] md:w-[calc((100%-12px)/2)] lg:w-[calc((100%-24px)/3)] "
                            >
                                <CategoryCard category={cat} lang={lang} dict={dict} />
                            </div>
                        ))}
                    </div>


                </div>
            </section>

            {/*Featured Section*/}
            <section className="flex flex-col items-center justify-center mt-12 mb-20">
                <div className="flex flex-col items-center justify-center mb-8 w-full max-w-[1200px] lg:max-w-[1400px] p-1 sm:p-0">
                    <div>
                        <h3 className="text-green-900 font-medium uppercase tracking-widest text-lg text-center">
                            {dict.highlights}
                        </h3>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 mt-3 text-center">
                            {dict.featuredevents}
                        </h2>
                    </div>


                    <div className="flex flex-wrap justify-center items-center max-w-dvw w-full box-border p-2 sm:p-1">
                        {places.map((place) => (
                            <div
                                key={place._id}
                                className="w-full md:w-1/2 md:max-w-1/2 xl:w-1/3 box-border md:p-3 sm:p-2 p-1 "
                            >

                                <PlaceCard key={place.slug[lang]} place={place} locale={lang} dict={dict} />
                            </div>
                        ))}
                    </div>




                </div>
            </section>
        </main>
    );
}