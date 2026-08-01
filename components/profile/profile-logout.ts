import type { Locale } from "@/lib/get-dictionary";

export type LogoutRequest = (
    input: string,
    init: { method: "POST" },
) => Promise<Response>;

type LogoutFromProfileOptions = {
    lang: Locale;
    request: LogoutRequest;
    replace: (href: string) => void;
};

export async function logoutFromProfile({
    lang,
    request,
    replace,
}: LogoutFromProfileOptions): Promise<void> {
    const response = await request("/api/auth/logout", { method: "POST" });

    if (!response.ok) {
        throw new Error("Logout failed");
    }

    replace(lang === "en" ? "/" : `/${lang}`);
}
