import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

import type { logoutFromProfile as LogoutFromProfile } from "../components/profile/profile-logout";

const { logoutFromProfile } = createRequire(import.meta.url)(
    "../components/profile/profile-logout.ts",
) as { logoutFromProfile: typeof LogoutFromProfile };

for (const [lang, expectedPath] of [
    ["en", "/"],
    ["ar", "/ar"],
    ["he", "/he"],
] as const) {
    test(`logs out and replaces the ${lang} profile with its home page`, async () => {
        let destination: string | undefined;

        await logoutFromProfile({
            lang,
            request: async (input, init) => {
                assert.equal(input, "/api/auth/logout");
                assert.deepEqual(init, { method: "POST" });
                return new Response(null, { status: 204 });
            },
            replace: (href) => {
                destination = href;
            },
        });

        assert.equal(destination, expectedPath);
    });
}

test("does not navigate when logout fails", async () => {
    let navigated = false;

    await assert.rejects(() => logoutFromProfile({
        lang: "en",
        request: async () => new Response(null, { status: 500 }),
        replace: () => {
            navigated = true;
        },
    }), /Logout failed/);

    assert.equal(navigated, false);
});
