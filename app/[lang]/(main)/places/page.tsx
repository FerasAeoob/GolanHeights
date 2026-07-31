import connectDB from "@/lib/mongodb";
import Place, { IPublicPlaceDTO } from "@/database/place.model";
import { toPublicPlaceDTO } from "@/lib/db/places";
import { perfLog } from "@/lib/perf";
import SearchBar from "@/components/search";
import PlaceCard from "@/components/places/placecard";
import FilterDropdown from "@/components/filter.dropdown";
import VillageFilter from "@/components/village.filter";
import { getDictionary } from "@/lib/get-dictionary";
import { IOpeningHoursDictionary } from "@/lib/types";
import { CATEGORY_SLUGS } from "@/lib/categories";
import { getCurrentUser } from "@/lib/auth";
import PlacesMapDynamic from "@/components/places/PlacesMapDynamic";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: 'en' | 'ar' | 'he' }> }): Promise<Metadata> {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const path = lang === 'en' ? '/places' : `/${lang}/places`;

    return {
        title: dict.exploreplaces || "Explore Places",
        description: dict.exploreplacesdesc || "Discover all places in the Golan Heights",
        alternates: {
            canonical: `https://www.golanwiki.com${path}`,
            languages: {
                'en': 'https://www.golanwiki.com/places',
                'he': 'https://www.golanwiki.com/he/places',
                'ar': 'https://www.golanwiki.com/ar/places',
                'x-default': 'https://www.golanwiki.com/places'
            }
        }
    };
}

export default async function PlacesPage({
    searchParams,
    params,
}: {
    searchParams: Promise<{ search?: string; category?: string; price?: string; sort?: string; villages?: string }>;
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
    const villagesParam = resolvedParams.villages || "";
    const selectedVillages = villagesParam ? villagesParam.split(",").filter(Boolean) : [];

    // Escape regex special characters to prevent ReDoS and injection
    function escapeRegex(str: string) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const safeQuery = escapeRegex(query);
    const safeCategory = escapeRegex(category);

    // Map village slugs to regex patterns matching DB location names
    const villageRegexMap: Record<string, string> = {
        "majdal-shams": "Majdal Shams",
        "masade": "Mas.*ade",
        "buqata": "Buq.*ata",
        "ein-qiniyye": "Ein Qiniyye",
    };
    const villageRegexPatterns = selectedVillages
        .map(slug => villageRegexMap[slug])
        .filter(Boolean);

    // Map common price symbols in search query to DB keys
    let searchPriceKey: string | null = null;
    if (safeQuery === "$") searchPriceKey = "low";
    else if (safeQuery === "$$") searchPriceKey = "mid";
    else if (safeQuery === "$$$") searchPriceKey = "high";
    else if (safeQuery.toLowerCase() === "free") searchPriceKey = "free";

    const filter: any = {
        hidden: { $ne: true },
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
        ...(villageRegexPatterns.length > 0 && {
            $or: villageRegexPatterns.map(pattern => ({
                "location.name.en": { $regex: pattern, $options: "i" }
            }))
        }),
    };
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };

    if (sort === "top-rated") {
        sortOption = {
            averageRating: -1,
            reviewsCount: -1,
        };
    }

    const t2 = performance.now();
    const rawPlaces = await Place.find(filter)
        .select("title slug images location averageRating reviewsCount category openHours open shortDescription price")
        .sort(sortOption)
        .limit(100)
        .lean();
    const places: IPublicPlaceDTO[] = rawPlaces.map(toPublicPlaceDTO);
    const t3 = performance.now();
    perfLog(`[PERF] PLACES /${lang}: parallel(dict+auth)=${((t1 - pageStart)).toFixed(1)}ms | dbQuery=${((t3 - t2)).toFixed(1)}ms | total=${((t3 - pageStart)).toFixed(1)}ms`);
    const openingHoursDict: IOpeningHoursDictionary = dict.openingHours;

    const villageOptions = [
        { label: dict.villages["majdal-shams"], slug: "majdal-shams" },
        { label: dict.villages.masade, slug: "masade" },
        { label: dict.villages.buqata, slug: "buqata" },
        { label: dict.villages["ein-qiniyye"], slug: "ein-qiniyye" },
    ];
    const villageFilterLabel = {
        he: "סינון לפי כפר",
        ar: "تحديد القرية",
        en: "Filter by village",
    }[lang];

    return (
        <div className="min-h-screen w-full bg-white">
            <section className="relative w-full overflow-hidden bg-zinc-950">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                    <div className="absolute top-[-80px] end-[-120px] h-[420px] w-[420px] rounded-full bg-brand-yellow/10 blur-3xl md:top-[-140px] md:end-[-180px] md:h-[720px] md:w-[720px]" />
                    <div className="absolute bottom-[-160px] start-[-180px] h-[360px] w-[360px] rounded-full bg-brand-blue/[0.06] blur-3xl md:h-[520px] md:w-[520px]" />
                </div>

                <div className="relative flex w-full flex-col px-4 pb-20 pt-25 sm:px-6 md:pb-24 md:pt-28">
                    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center text-center">
                        <h1 className="mb-5 max-w-4xl text-[34px] font-extrabold leading-[1.25] tracking-tight text-white sm:text-5xl md:text-6xl">
                            {dict.exploreplaces}
                        </h1>
                        <p className="max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg md:text-xl">
                            {dict.exploreplacesdesc}
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative z-20 mx-auto -mt-8 w-full max-w-[1200px] px-4 sm:px-6 md:-mt-10">
                <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-emerald-950/10 md:p-6">
                    <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
                        <div className="min-w-0 flex-1">
                            <SearchBar placeholder={dict.searchplaceholder} />
                        </div>
                        <div className="grid w-full grid-cols-2 gap-3 lg:w-auto">
                            <div className="min-w-0 lg:w-52">
                                <FilterDropdown
                                    title={dict.categories.all}
                                    paramKey="category"
                                    options={[
                                        dict.categories.all,
                                        ...CATEGORY_SLUGS.map((slug) => dict.categories[slug] || slug),
                                    ]}
                                    slugs={["", ...CATEGORY_SLUGS]}
                                />
                            </div>
                            <div className="min-w-0 lg:w-52">
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
                        </div>
                    </div>

                    <VillageFilter options={villageOptions} label={villageFilterLabel} />
                </div>
            </section>

            <section className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 md:py-16">
                <div
                    className="flex w-full flex-wrap items-stretch justify-center gap-5"
                    dir="ltr"
                >
                    {places.length > 0 ? (
                        places.map((place: IPublicPlaceDTO) => (
                            <div
                                key={place._id.toString()}
                                className="relative w-full md:w-[calc(50%-0.625rem)] xl:w-[calc(33.333%-0.875rem)]"
                            >
                                <PlaceCard
                                    place={place}
                                    locale={lang}
                                    dict={dict}
                                    appearance="places"
                                    currentUserId={currentUser?._id?.toString()}
                                    initialIsFavorite={
                                        currentUser?.favorites?.some(
                                            (favorite) =>
                                                favorite.toString() === place._id.toString(),
                                        ) ?? false
                                    }
                                />
                            </div>
                        ))
                    ) : (
                        <div
                            className="flex min-h-48 w-full items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 px-6 py-12 text-center"
                            dir="auto"
                        >
                            <p className="text-base font-medium text-slate-600 md:text-lg">
                                {dict.noplacesfound} &#34;{query}&#34;
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <section className="mx-auto mb-16 w-full max-w-[1200px] px-4 sm:px-6 md:mb-24">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <PlacesMapDynamic
                        places={JSON.parse(JSON.stringify(places))}
                        lang={lang}
                        dict={dict}
                    />
                </div>
            </section>
        </div>
    );
}
