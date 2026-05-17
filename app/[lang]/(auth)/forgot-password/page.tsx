import { getDictionary } from "@/lib/get-dictionary";
import ForgotPasswordForm from "@/components/auth/ForgotPassword.Form";
import Image from "next/image";

export const revalidate = 3600; // 1 hour

export default async function ForgotPasswordPage({
    params,
}: {
    params: Promise<{ lang: "en" | "ar" | "he" }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <>
            {/* Background */}
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

            {/* Main */}
            <section className="min-h-screen overflow-y-auto max-w-[1200px] mx-auto w-full px-4 py-24 relative z-10 flex items-start justify-center sm:items-center">
                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-10">
                    {/* Form */}
                    <div className="w-full max-w-md">
                        <ForgotPasswordForm lang={lang} dict={dict} />
                    </div>

                    {/* Quote */}
                    <div className="flex flex-col gap-3 w-full max-w-md items-center text-center md:items-start md:text-start">
                        <h1 className="text-white text-shadow-lg text-3xl md:text-4xl font-bold">
                            {dict?.auth?.qoute || "Elevation changes your perspective. The Heights change your soul."}
                        </h1>

                        <div className="w-[50%] h-[2px] bg-white/80"></div>
                    </div>
                </div>
            </section>
        </>
    );
}
