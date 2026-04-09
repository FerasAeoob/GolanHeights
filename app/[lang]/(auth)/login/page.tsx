import { getDictionary } from "@/lib/get-dictionary";
import LoginForm from "@/components/auth/Login.Form";
import Image from "next/image";

export default async function LoginPage({
    params,
}: {
    params: Promise<{ lang: "en" | "ar" | "he" }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <>
            <div className="fixed inset-0 -z-10 bg-black">
                <Image src="https://res.cloudinary.com/dsjzcazdi/image/upload/v1774787693/Whisk_6213f7945e718019a174712d62700d7bdr_ekqzne.webp"
                    alt="auth-bg"
                    fill
                    className="object-cover opacity-90"
                    priority
                />
            </div>
            <section className="max-w-[1200px] mx-auto w-full px-4 py-16 my-auto">
                <div className="flex flex-col gap-4 max-w-md mx-auto">


                    <LoginForm lang={lang} dict={dict} />
                </div>

            </section>
        </>
    );
}
