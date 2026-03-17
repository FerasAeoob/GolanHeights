import connectDB from "@/lib/mongodb";
import Place, { IPlaceSerializable } from "@/database/place.model";
import SearchBar from "@/components/search"; // Adjust path if needed
import PlaceCard from "@/components/placecard"; // Adjust path if needed
import CategoryDropdown from "@/components/category.dropdown";
import FilterDropdown from "@/components/filter.dropdown";

export default async function PlacesPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; category?: string }>;
}) {
    // 1. Read the URL to see if the user searched for anything
    const resolvedParams = await searchParams;
    const query = resolvedParams.search || "";
    const category = resolvedParams.category || "";

    // 2. Connect and fetch from the database
    await connectDB();

    const filter: any = {
        ...(query && {
            $or: [
                { "title.en": { $regex: query, $options: "i" } },
                { "title.he": { $regex: query, $options: "i" } },
                { "title.ar": { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
                { "description.en": { $regex: query, $options: "i" } },
                { "description.he": { $regex: query, $options: "i" } },
                { "description.ar": { $regex: query, $options: "i" } },
            ],
        }),
        ...(category && { category: { $regex: category, $options: "i" } }),

    };

    const places = await Place.find(filter).lean();

    // 3. Render your custom UI
    return (
        <>
            <section className="flex flex-col items-center justify-center mb-20">
                <div className="flex flex-col h-[25rem] items-center bg-emerald-700 w-full pt-10">
                    <div className="flex flex-col h-full mb-8 mt-10  w-full max-w-[1200px] lg:max-w-[1400px] justify-center p-2 sm:p-1 border-1">
                        {/* Headers */}

                        <h3 className="  uppercase font-bold text-3xl md:text-4xl text-white md:p-3 sm:p-2 p-1 ">
                            Explore Places
                        </h3>
                        <h2 className="text-xl  md:text-2xl text-white/80 mb-6 mt-3r md:px-3 sm:px-2 px-1">
                            Discover amazing attractions, restaurants, and experiences throughout the Golan Heights.
                        </h2>
                    </div>
                </div>
            </section>
            <section className="flex flex-col items-center justify-center mt-12 mb-20">
                <div className="flex  items-center border-1 border-black h-[5rem] mb-8 w-full max-w-[1200px] lg:max-w-[1400px]  border-box " >
                    <div className="flex flex-wrap h-full w-full items-center max-w-dvw w-full box-border p-2 sm:p-1">

                        {/* Search Bar Wrapper - Added a wrapper to center it and give it some bottom margin */}
                        <div className="flex h-full items-center justify-center w-1/2 border-box md:p-3 sm:p-2 p-1">
                            <SearchBar />

                        </div>
                        <div className="flex  h-full items-center justify-center ">

                            <FilterDropdown
                                title="categories"
                                paramKey="category"
                                options={[
                                    "All categories",
                                    "Nature",
                                    "Restaurant",
                                    "Activity",
                                    "Hotel",
                                    "Viewpoint"
                                ]}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center border-1 border-black justify-center mb-8 w-full max-w-[1200px] lg:max-w-[1400px] " >

                    {/* Your Responsive Grid */}
                    <div className="flex flex-wrap justify-center items-center max-w-dvw w-full box-border p-2 sm:p-1">
                        {places.length > 0 ? (
                            (places as unknown as IPlaceSerializable[]).map((place: IPlaceSerializable) => (
                                <div
                                    // Converted _id to string just in case it's a raw MongoDB ObjectId
                                    key={place._id.toString()}
                                    className="w-full md:w-1/2 md:max-w-1/2 xl:w-1/3 box-border md:p-3 sm:p-2 p-1"
                                >
                                    {/* Removed the duplicate key prop here. Only the parent div needs it! */}
                                    <PlaceCard place={place} />
                                </div>
                            ))
                        ) : (
                            // Fallback UI if the search query returns nothing
                            <div className="w-full text-center mt-12">
                                <p className="text-lg text-slate-500">
                                    No places found matching &#34;{query}&#34;. Try a different search!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {/*<section className="flex flex-col items-center justify-center mt-12 mb-20">*/}
            {/*    <div className="flex flex-col items-center justify-center mb-8 w-full max-w-[1200px] lg:max-w-[1400px] p-1 sm:p-0">*/}
            {/*        <div>*/}
            {/*            <h3 className="text-green-900 font-medium uppercase tracking-widest text-lg text-center">*/}
            {/*                Highlights*/}
            {/*            </h3>*/}
            {/*            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 mt-3 text-center">*/}
            {/*                Featured Events*/}
            {/*            </h2>*/}
            {/*        </div>*/}


            {/*        <div className="flex flex-wrap justify-center items-center max-w-dvw w-full box-border p-2 sm:p-1">*/}
            {/*            {places.map((place) => (*/}
            {/*                <div*/}
            {/*                    key={place._id}*/}
            {/*                    className="w-full md:w-1/2 md:max-w-1/2 xl:w-1/3 box-border md:p-3 sm:p-2 p-1 "*/}
            {/*                >*/}

            {/*                    <PlaceCard key={place.slug} place={place} />*/}
            {/*                </div>*/}
            {/*            ))}*/}
            {/*        </div>*/}




            {/*    </div>*/}
            {/*</section>*/}

        </>
    );
}