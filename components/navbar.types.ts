import type { serializeUser } from "@/lib/auth";

export type NavbarUser = ReturnType<typeof serializeUser> | null;

export interface NavbarDictionary {
    nav?: {
        menu?: string;
        home?: string;
        favorites?: string;
        profile?: string;
        notifications?: string;
        adminPanel?: string;
        history?: string;
        contact?: string;
        about?: string;
        openMenu?: string;
        closeMenu?: string;
    };
    profile?: {
        logout?: string;
    };
    auth?: {
        login?: string;
    };
}
