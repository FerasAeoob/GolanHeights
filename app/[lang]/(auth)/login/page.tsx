import { getDictionary } from "@/lib/get-dictionary";
import LoginForm from "@/components/auth/Login.Form";

export default async function LoginPage({
    params,
}: {
    params: Promise<{ lang: "en" | "ar" | "he" }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <section className="max-w-[1200px] mx-auto px-4 py-16">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
                {dict?.loginPage?.title || "Login"}
            </h1>
            <p className="text-slate-600">
                {dict?.loginPage?.description || "Login to your account"}
            </p>
            <LoginForm lang={lang} dict={dict} />
        </section>
    );
}
