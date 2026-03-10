import '../../globals.css';
import CategoryCard from "@/components/homecomps/categorycard";
import categories from "@/components/cate-pics/categories"; // Ensure this is the array
import HeroSection from "@/components/homecomps/herosection";
import PlaceCard from "@/components//homecomps/placecard";
import Place, { IPlace } from "@/database/place.model"; // 🟢 1. Added IPlace import here

import connectDB from "@/lib/mongodb";

export default async function HomePage() {
    await connectDB();


    const rawPlaces = await Place.find({}).lean();



    const places = rawPlaces.map((place: IPlace) => ({
        ...place,
        _id: String(place._id),
        createdAt: place.createdAt ? String(place.createdAt) : undefined,
        updatedAt: place.updatedAt ? String(place.updatedAt) : undefined,
    }));

    return (
        <main className="min-h-screen w-[vdw]">
            {/* Hero Section */}
            <div className="flex flex-col w-full h-[20rem] bg-emerald-700 justify-center items-center p-2 sm:p-0">
                <div className="flex flex-col w-full h-[20rem] justify-center max-w-[1200px] lg:max-w-[1400px]  md:p-3  sm:p-2 p-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 mt-5 text-white">Explore Places</h1>
                    <p className="text-white/80 md:text-2xl text-xl">Discover amazing attractions, restaurants, and experiences throughout the Golan Heights.</p>
                </div>
            </div>


            {/* Categories Section */}


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
                                className="w-full md:w-1/2 md:max-w-1/2 xl:w-1/3 box-border  md:p-3  sm:p-2 p-1  "
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