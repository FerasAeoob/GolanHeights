import SignupForm from "@/components/auth/Signup.Form";
import { getDictionary } from "@/lib/get-dictionary";

export default async function SignupPage({
    params,
}: {
    params: Promise<{ lang: "en" | "ar" | "he" }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    return (
        <section className="max-w-[1200px] mx-auto px-4 py-16">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
                {dict?.signupPage?.title || "Signup"}
            </h1>
            <p className="text-slate-600">
                {dict?.signupPage?.description || "Signup to your account"}
            </p>
            <SignupForm dict={dict} lang={lang} />
        </section>
    );
}