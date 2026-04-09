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
    return (<>
        <div className="fixed inset-0 -z-10 bg-black">
            <Image src="https://res.cloudinary.com/dsjzcazdi/image/upload/v1774787693/Whisk_6213f7945e718019a174712d62700d7bdr_ekqzne.webp"
                alt="auth-bg"
                fill
                className="object-cover opacity-90"
                priority
            />
        </div>
        <section className="max-w-[1200px] mx-auto w-full px-4 relative z-10 h-dvh flex flex-col justify-center items-center overflow-hidden">
            <div className="flex flex-col gap-4 w-full max-w-md">
                <h1 className="text-3xl font-bold  text-white">
                    {dict?.signupPage?.title || "Signup"}
                </h1>
                <p className="text-white ">
                    {dict?.signupPage?.description || "Signup to your account"}
                </p>



                <SignupForm dict={dict} lang={lang} />
            </div>

        </section>

    </>
    );
}