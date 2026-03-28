import PlaceForm from "@/components/admin/PlaceForm";

export default async function NewPlacePage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;

    return <PlaceForm mode="create" lang={lang} />;
}
