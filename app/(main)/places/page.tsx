import connectDB from "@/lib/mongodb";
import Place, { IPlaceSerializable } from "@/database/place.model";
import SearchBar from "@/components/search"; // Adjust path if needed
import PlaceCard from "@/components/homecomps/placecard"; // Adjust path if needed
import Filters from "@/components/homecomps/filters";

export default async function PlacesPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    // 1. Read the URL to see if the user searched for anything
    const resolvedParams = await searchParams;
    const query = resolvedParams.search || "";

    // 2. Connect and fetch from the database
    await connectDB();

    const filter = query
        ? {
            $or: [
                { "title.en": { $regex: query, $options: "i" } }, // English
                { "title.he": { $regex: query, $options: "i" } }, // Hebrew
                { "title.ar": { $regex: query, $options: "i" } }, // Arabic 👈 Added this
                { category: { $regex: query, $options: "i" } },
                { "description.en": { $regex: query, $options: "i" } },
                { "description.he": { $regex: query, $options: "i" } },
                { "description.ar": { $regex: query, $options: "i" } },
            ],
        }
        : {};

    const places = await Place.find(filter).lean();

    // 3. Render your custom UI
    return (
        <>
            <section className="flex flex-col items-center justify-center mb-20">
                <div className="flex flex-col h-[20rem] items-center bg-emerald-700 w-full ">
                    <div className="flex flex-col h-full mb-8 mt-15  w-full max-w-[1200px] lg:max-w-[1400px] p-1 sm:p-0 justify-center">
                        {/* Headers */}

                        <h3 className=" font-medium uppercase tracking-widest text-lg">
                            Highlights
                        </h3>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 mt-3r">
                            Featured Events
                        </h2>
                    </div>
                </div>
            </section>
            <section className="flex flex-col items-center justify-center mt-12 mb-20">
                <div className="flex flex-col items-center justify-center mb-8 w-full max-w-[1200px] lg:max-w-[1400px] p-1 sm:p-0">


                    {/* Search Bar Wrapper - Added a wrapper to center it and give it some bottom margin */}
                    <div className="w-full max-w-md mb-10 px-4">
                        <SearchBar />
                        <Filters />
                    </div>

                    {/* Your Responsive Grid */}
                    <div className="flex flex-wrap justify-center max-w-dvw w-full box-border p-2 sm:p-0">
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
        </>
    );
}