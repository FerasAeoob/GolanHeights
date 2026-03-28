import PlaceForm from "@/components/admin/PlaceForm";
import { getPlaceById } from "@/lib/db/places";
import { notFound } from "next/navigation";

export default async function EditPlacePage({
    params,
}: {
    params: Promise<{ lang: string; id: string }>;
}) {
    const { lang, id } = await params;

    const place = await getPlaceById(id);
    if (!place) notFound();

    return <PlaceForm mode="edit" initialData={place} lang={lang} />;
}
