import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Place, { IPlaceSerializable } from "@/database/place.model";
import PlaceCard from "@/components/placecard";
import { getDictionary } from "@/lib/get-dictionary";
import FavoriteCardLiveItem from "@/components/favorites/Favorite.Card.Live";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ lang: "en" | "ar" | "he" }>;
}) {
  const { lang } = await params;

  const [dict, currentUser] = await Promise.all([
    getDictionary(lang),
    getCurrentUser(),
  ]);

  if (!currentUser) {
    return (
      <section className="lg:max-w-[1400px] max-w-[1200px] mt-35 mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          {dict?.favoritesPage?.title || "My Favorites"}
        </h1>
        <p className="text-slate-600">
          {dict?.favoritesPage?.loginRequired || "You must be logged in to view your favorites."}
        </p>
      </section>
    );
  }

  await connectDB();

  const favorites = await Place.find({
    _id: { $in: currentUser.favorites || [] },
  })
    .select("title slug images location averageRating reviewsCount category openHours open shortDescription")
    .lean() as unknown as IPlaceSerializable[];

  return (
    <section className="lg:max-w-[1400px] max-w-[1200px] mt-35 mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          {dict?.favoritesPage?.title || "My Favorites"}
        </h1>
        <p className="mt-2 text-slate-600">
          {dict?.favoritesPage?.description || "Places you saved for later."}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">
            {dict?.favoritesPage?.empty || "You have no favorite places yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center items-center w-full gap-4">
          {favorites.map((place) => (
            <div
              key={place._id.toString()}
              className="relative w-full md:w-[calc(50%-0.5rem)] xl:w-[calc(33.333%-0.75rem)]"
            >
              <FavoriteCardLiveItem placeId={place._id.toString()}>
                <PlaceCard
                  place={place}
                  locale={lang}
                  dict={dict}
                  currentUserId={currentUser._id?.toString()}
                  initialIsFavorite={true}
                />
              </FavoriteCardLiveItem>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}