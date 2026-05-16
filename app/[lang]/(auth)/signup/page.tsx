import SignupForm from "@/components/auth/Signup.Form";
import { getDictionary } from "@/lib/get-dictionary";
import Image from "next/image";



export default async function SignupPage({
    params,
}: {
    params: Promise<{ lang: "en" | "ar" | "he" }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);



    return (
        <>
            <div className="fixed inset-0 -z-10 bg-black">
                <Image
                    src="https://res.cloudinary.com/dsjzcazdi/image/upload/v1774787693/Whisk_6213f7945e718019a174712d62700d7bdr_ekqzne.webp"
                    alt="auth-bg"
                    fill
                    className="object-cover opacity-90"
                    priority
                />
                <div className="absolute inset-0 bg-black/25" />
            </div>

            <section className="min-h-screen overflow-y-auto w-full px-4 py-24 relative z-10 flex items-start justify-center sm:items-center">
                <div className="w-full max-w-md">
                    <SignupForm dict={dict} lang={lang} />
                </div>
            </section>
        </>
    );
}