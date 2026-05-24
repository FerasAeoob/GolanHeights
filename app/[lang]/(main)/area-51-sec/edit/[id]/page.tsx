import PlaceForm from "@/components/admin/PlaceForm";
import { getPlaceById } from "@/lib/db/places";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/lib/get-dictionary";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export default async function EditPlacePage({
    params,
}: {
    params: Promise<{ lang: string; id: string }>;
}) {
    const { lang, id } = await params;

    // 1. Validate ObjectId early
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidId) {
        notFound();
    }

    // 2. Fetch authenticated user
    const user = await getCurrentUser();

    // 3. If unauthenticated, redirect to login
    if (!user) {
        redirect(`/${lang}/login`);
    }

    // 4. If authenticated but not admin, return notFound (to avoid exposing place existence)
    if (!isAdmin(user)) {
        notFound();
    }

    // 5. Fetch place after security clearance
    const place = await getPlaceById(id);
    if (!place) {
        notFound();
    }


    const dict = await getDictionary(lang as "en" | "he" | "ar");

    return <PlaceForm mode="edit" initialData={place} lang={lang} dict={dict} />;
}


