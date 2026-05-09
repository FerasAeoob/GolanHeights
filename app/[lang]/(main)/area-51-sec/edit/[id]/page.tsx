import PlaceForm from "@/components/admin/PlaceForm";
import { getPlaceById } from "@/lib/db/places";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/get-dictionary";

export default async function EditPlacePage({
    params,
}: {
    params: Promise<{ lang: string; id: string }>;
}) {
    const { lang, id } = await params;

    const place = await getPlaceById(id);
    if (!place) notFound();

    const dict = await getDictionary(lang as "en" | "he" | "ar");

    return <PlaceForm mode="edit" initialData={place} lang={lang} dict={dict} />;
}
