import '../globals.css';
import CategoryCard from "@/components/homecomps/categorycard";
import categories from "@/components/cate-pics/categories"; // Ensure this is the array
import HeroSection from "@/components/homecomps/herosection";
import PlaceCard from "@/components//homecomps/placecard";
import Place, { IPlace } from "@/database/place.model"; // 🟢 1. Added IPlace import here

import connectDB from "@/lib/mongodb";

export default async function HomePage() {
    await connectDB();

    // 🟢 FIX 1: Removed { featured: true } so it fetches EVERYTHING in your database
    const rawPlaces = await Place.find({ featured: true }).limit(6).lean();

    ;

    // 🟢 FIX 2: Added 'any' (or you can use 'IPlace') so ESLint doesn't complain
    const places = rawPlaces.map((place: IPlace) => ({
        ...place,
        _id: String(place._id),
        createdAt: place.createdAt ? String(place.createdAt) : undefined,
        updatedAt: place.updatedAt ? String(place.updatedAt) : undefined,
    }));

    return (
        <main className="min-h-screen w-[vdw]">
            {/* Hero Section */}
            <section className="pb-10">
                <HeroSection />
            </section>

            {/* Categories Section */}
            <section className="flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center mb-8 w-full max-w-[1200px] lg:max-w-[1400px]  ">

                    <div className="flex flex-col items-center justify-center mb-8 w-[85%]">
                        <h3 className="text-green-900 font-medium uppercase tracking-widest text-lg text-center">
                            Discover
                        </h3>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 mt-3 text-center">
                            Explore by Category
                        </h2>
                        <p className="relative text-lg md:text-xl text-center">
                            From ancient ruins to adventure sports, the Golan Heights offers something for every traveler.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center max-w-dvw w-full box-border p-2 sm:p-0">
                        {categories.map((cat) => (
                            <div
                                key={cat.slug}
                                className="w-1/2 md:w-1/2 sm:max-w-1/2 lg:w-1/3 max-w-[350px] box-border md:p-3  sm:p-2 p-1 "
                            >
                                <CategoryCard category={cat} />
                            </div>
                        ))}
                    </div>


                </div>
            </section>

            {/* Featured Section */}
            <section className="flex flex-col items-center justify-center mt-12 mb-20">
                <div className="flex flex-col items-center justify-center mb-8 w-full max-w-[1200px] lg:max-w-[1400px] p-1 sm:p-0">
                    <div>
                        <h3 className="text-green-900 font-medium uppercase tracking-widest text-lg text-center">
                            Highlights
                        </h3>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 mt-3 text-center">
                            Featured Events
                        </h2>
                    </div>


                    <div className="flex flex-wrap justify-center max-w-dvw w-full  box-border p-2 sm:p-0">
                        {places.map((place) => (
                            <div
                                key={place._id}
                                className="w-full sm:w-1/2 md:max-w-1/2 xl:w-1/3 box-border  md:p-3  sm:p-2 p-1  "
                            >

                                <PlaceCard key={place.slug} place={place} />
                            </div>
                        ))}
                    </div>




                </div>
            </section>
        </main>
    );
}