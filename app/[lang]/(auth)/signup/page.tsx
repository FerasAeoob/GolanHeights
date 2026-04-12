import SignupForm from "@/components/auth/Signup.Form";
import { getDictionary } from "@/lib/get-dictionary";
import Image from "next/image";


// Public page, same HTML for all users per locale — safe to cache
export const revalidate = 3600; // 1 hour

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

            <section className="max-w-[1200px] min-h-[100dvh] mx-auto w-full px-4 pt-20 md:pt-24 relative z-10 flex items-start md:items-center justify-center">
                <div className="flex flex-col gap-4 w-[350px] h-[625px] md:w-[400px]">
                    <SignupForm dict={dict} lang={lang} />
                </div>
            </section>
        </>
    );
}