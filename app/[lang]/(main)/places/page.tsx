import connectDB from "@/lib/mongodb";
import Place, { IPlaceSerializable } from "@/database/place.model";
import { perfLog } from "@/lib/perf";
import SearchBar from "@/components/search";
import PlaceCard from "@/components/placecard";
import FilterDropdown from "@/components/filter.dropdown";
import { getDictionary } from "@/lib/get-dictionary";
import { IOpeningHoursDictionary } from "@/lib/types";
import { CATEGORY_SLUGS } from "@/lib/categories";
import { getCurrentUser } from "@/lib/auth";

export default async function PlacesPage({
    searchParams,
    params,
}: {
    searchParams: Promise<{ search?: string; category?: string; price?: string; sort?: string }>;
    params: Promise<{ lang: 'en' | 'ar' | 'he' }>;
}) {
    const pageStart = performance.now();
    const { lang } = await params;
    const resolvedParams = await searchParams;

    // Parallelize: dictionary, DB connection, and auth all at once
    const [dict, currentUser] = await Promise.all([
        getDictionary(lang),
        (async () => { await connectDB(); return getCurrentUser(); })()
    ]);
    const t1 = performance.now();

    const query = resolvedParams.search || "";
    const category = resolvedParams.category || "";
    const price = resolvedParams.price || "";
    const sort = resolvedParams.sort || "";

    // Escape regex special characters to prevent ReDoS and injection
    function escapeRegex(str: string) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const safeQuery = escapeRegex(query);
    const safeCategory = escapeRegex(category);

    // Map common price symbols in search query to DB keys
    let searchPriceKey: string | null = null;
    if (safeQuery === "$") searchPriceKey = "low";
    else if (safeQuery === "$$") searchPriceKey = "mid";
    else if (safeQuery === "$$$") searchPriceKey = "high";
    else if (safeQuery.toLowerCase() === "free") searchPriceKey = "free";

    const filter: any = {
        ...(safeQuery && {
            $or: [
                { "title.en": { $regex: safeQuery, $options: "i" } },
                { "title.he": { $regex: safeQuery, $options: "i" } },
                { "title.ar": { $regex: safeQuery, $options: "i" } },
                // category is a plain slug string (e.g. "food-drink"), not a localized object
                { category: { $regex: safeQuery, $options: "i" } },
                { "description.en": { $regex: safeQuery, $options: "i" } },
                { "description.he": { $regex: safeQuery, $options: "i" } },
                { "description.ar": { $regex: safeQuery, $options: "i" } },
                // If the user typed a symbol like "$", "$$", or "free", also match the price field
                ...(searchPriceKey ? [{ price: searchPriceKey }] : []),
            ],
        }),
        ...(safeCategory && { category: { $regex: safeCategory, $options: "i" } }),
        ...(price && { price }),
    };
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };

    if (sort === "top-rated") {
        sortOption = {
            averageRating: -1,
            reviewsCount: -1,
        };
    }

    const t2 = performance.now();
    const places = await Place.find(filter)
        .select("title slug images location averageRating reviewsCount category openHours open shortDescription price")
        .sort(sortOption)
        .lean();
    const t3 = performance.now();
    perfLog(`[PERF] PLACES /${lang}: parallel(dict+auth)=${((t1-pageStart)).toFixed(1)}ms | dbQuery=${((t3-t2)).toFixed(1)}ms | total=${((t3-pageStart)).toFixed(1)}ms`);
    const openingHoursDict: IOpeningHoursDictionary = dict.openingHours;
    // 3. Render your custom UI
    return (

        <>
            <section className="flex flex-col md:h-[25rem] h-[20rem] bg-emerald-700  ">

                <div className="flex flex-col h-full mb-8 mt-10 mx-auto  w-full max-w-[1200px] lg:max-w-[1400px] justify-center gap-4 px-4">
                    {/* Headers */}

                    <h3 className="  uppercase font-bold text-3xl md:text-4xl text-white">
                        {dict.exploreplaces}
                    </h3>
                    <h2 className="text-xl  md:text-2xl text-white/80 ">
                        {dict.exploreplacesdesc}
                    </h2>
                </div>

            </section>
            <section className="max-w-[1400px] mx-auto px-4 -mt-16 md:-mt-12 ">
                <div className="bg-white rounded-2xl shadow-xl shadow-emerald-900/10 p-4 md:p-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center border border-slate-100">


                    <div className="flex-grow">
                        <SearchBar placeholder={dict.searchplaceholder} />

                    </div>
                    <div className="flex flex-row gap-3 w-full md:w-auto">
                        <div className="flex-1 md:w-48">

                            <FilterDropdown
                                title={dict.categories.all}
                                paramKey="category"
                                options={[
                                    dict.categories.all,
                                    ...CATEGORY_SLUGS.map(slug => dict.categories[slug] || slug)
                                ]}
                                slugs={["", ...CATEGORY_SLUGS]}
                            />
                        </div>
                        <div className="flex-1 md:w-48">
                            <FilterDropdown
                                title={dict.price.any}
                                paramKey="price"
                                options={[
                                    dict.price.any,
                                    dict.price.free,
                                    dict.price.low,
                                    dict.price.mid,
                                    dict.price.high,
                                ]}
                                slugs={["", "free", "low", "mid", "high"]}
                            />
                        </div>
                        {/* <div className="flex-1 md:w-48">
                            <FilterDropdown
                                title={dict.sort.title}
                                paramKey="sort"
                                options={[
                                    dict.sort.newest,
                                    dict.sort.topRated
                                ]}
                                slugs={[
                                    "", // default (newest)
                                    "top-rated"
                                ]}
                            />
                        </div> */}
                    </div>



                </div>
            </section>
            <section className="max-w-[1400px] px-4 mx-auto mt-10 md:mt-15 ">
                <div className="flex flex-col items-center justify-center w-full max-w-[1200px] lg:max-w-[1400px] " >

                    {/* Your Responsive Grid */}
                    <div className="flex flex-wrap justify-center items-center max-w-dvw w-full box-border gap-4">
                        {places.length > 0 ? (
                            (places as unknown as IPlaceSerializable[]).map((place: IPlaceSerializable) => (
                                <div

                                    // Converted _id to string just in case it's a raw MongoDB ObjectId
                                    key={place._id.toString()}
                                    className="relative w-full md:w-[calc(50%-0.5rem)] xl:w-[calc(33.333%-0.75rem)]"
                                >

                                    <PlaceCard
                                        key={place._id}
                                        place={place}
                                        locale={lang}
                                        dict={dict}
                                        currentUserId={currentUser?._id?.toString()}
                                        initialIsFavorite={currentUser?.favorites?.some(f => f.toString() === place._id.toString()) ?? false}
                                    />
                                </div>
                            ))
                        ) : (
                            // Fallback UI if the search query returns nothing
                            <div className="w-full text-center mt-12">
                                <p className="text-lg text-slate-500">
                                    {dict.noplacesfound} &#34;{query}&#34;
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </section >
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