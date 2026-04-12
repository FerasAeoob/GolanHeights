import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Place, { IPlaceSerializable } from "@/database/place.model";
import PlaceCard from "@/components/placecard";
import { getDictionary } from "@/lib/get-dictionary";
import FavoriteCardLiveItem from "@/components/favorites/Favorite.Card.Live";
import FavoritesEmptyState from "@/components/favorites/FavoritesEmptyState";

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
    <section className="lg:max-w-[1400px] max-w-[1200px] mt-35 mx-auto px-4 pb-20">
      {/* Premium Hero Section */}
      <div className="mb-10 text-center md:text-start border-b border-gray-100 pb-8 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
          {dict?.favoritesPage?.title || "Your Favorites"}
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          {dict?.favoritesPage?.subtitle || "Places you saved for later."}
        </p>
      </div>

      {favorites.length === 0 ? (
        <FavoritesEmptyState dict={dict} lang={lang} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((place) => (
            <FavoriteCardLiveItem key={place._id.toString()} placeId={place._id.toString()}>
              <PlaceCard
                place={place}
                locale={lang}
                dict={dict}
                currentUserId={currentUser._id?.toString()}
                initialIsFavorite={true}
              />
            </FavoriteCardLiveItem>
          ))}
        </div>
      )}
    </section>
  );
}