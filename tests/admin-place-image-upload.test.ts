import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test, { beforeEach, after } from "node:test";
import type { NextRequest as NextRequestType } from "next/server";

const require = createRequire(import.meta.url);
require("./helpers/load-ts.cjs");
const { NextRequest } = require("next/server") as typeof import("next/server");
const moduleLoader = require("node:module") as {
    _load: (id: string, parent: unknown, isMain: boolean) => unknown;
};
const originalLoad = moduleLoader._load;
let authError: string | undefined;
let limiter = { allowed: true, remaining: 59, resetAt: Date.now(), reason: undefined as string | undefined };
let limiterRules: unknown;
let limiterError = false;
let cloudConfig: Record<string, string>;
let uploadResult: { secure_url?: string };
let uploadError = false;
let uploads: Array<{ data: string; options: Record<string, unknown> }> = [];
moduleLoader._load = function (id, parent, isMain) {
    if (id === "@/lib/permissions") return {
        requireRole: async (roles: string[]) => {
            assert.deepEqual(roles, ["admin"]);
            if (authError) throw new Error(authError);
            return { _id: "admin-database-id", role: "admin", isVerified: false };
        },
    };
    if (id === "@/lib/rate-limit") return {
        checkSensitiveRateLimits: async (rules: unknown) => {
            limiterRules = rules;
            if (limiterError) throw new Error("private Redis error");
            return limiter;
        },
        rateLimitKey: (...parts: string[]) => parts.join(":"),
    };
    if (id === "cloudinary") return { v2: {
        config: () => cloudConfig,
        uploader: { upload: async (data: string, options: Record<string, unknown>) => {
            uploads.push({ data, options });
            if (uploadError) throw new Error("private upstream error");
            return uploadResult;
        } },
    } };
    return originalLoad.call(this, id, parent, isMain);
};
const { POST } = require("../app/api/admin/place-images/upload/route.ts") as {
    POST: (request: NextRequestType) => Promise<Response>;
};
moduleLoader._load = originalLoad;
const { uploadPlacePhotos, appendPlaceImage } = require(
    "../components/admin/place-image-upload.ts",
) as typeof import("../components/admin/place-image-upload");

const savedEnvironment = { ...process.env };
beforeEach(() => {
    authError = undefined;
    limiter = { allowed: true, remaining: 59, resetAt: Date.now(), reason: undefined };
    limiterRules = undefined;
    limiterError = false;
    cloudConfig = { cloud_name: "test", api_key: "test", api_secret: "test" };
    uploadResult = { secure_url: "https://res.cloudinary.com/test/image/upload/new.webp" };
    uploadError = false;
    uploads = [];
    Object.assign(process.env, { NODE_ENV: "test" });
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
});
after(() => { process.env = savedEnvironment; });

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
function imageForm(bytes: Uint8Array = jpeg, mime = "image/jpeg") {
    const form = new FormData();
    form.append("image", new Blob([new Uint8Array(bytes)], { type: mime }), "photo.jpg");
    return form;
}
function request(body: BodyInit = imageForm(), headers: Record<string, string> = {}) {
    return new NextRequest("https://example.test/api/admin/place-images/upload", {
        method: "POST", body, headers: { "X-Requested-With": "PlaceForm", ...headers },
    });
}
async function expectError(req: NextRequestType, status: number, errorCode: string) {
    const response = await POST(req);
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { success: false, errorCode });
    assert.equal(uploads.length, 0);
    return response;
}

for (const [error, status, code] of [["Unauthorized", 401, "UNAUTHORIZED"], ["Forbidden", 403, "FORBIDDEN"]] as const) {
    test(`rejects ${error} before reading the upload`, async () => {
        authError = error;
        await expectError(request(), status, code);
        assert.equal(limiterRules, undefined);
    });
}
test("rejects cross-site and unmarked multipart requests", async () => {
    await expectError(request(imageForm(), { "X-Requested-With": "" }), 400, "INVALID_REQUEST");
    await expectError(request(imageForm(), { Origin: "https://attacker.test" }), 400, "INVALID_REQUEST");
    await expectError(request(imageForm(), { "Sec-Fetch-Site": "cross-site" }), 400, "INVALID_REQUEST");
});
for (const host of ["www.golanwiki.com", "golanwiki-preview.vercel.app"]) {
    test(`accepts the actual PlaceForm request through an HTTPS proxy for ${host}`, async () => {
        Object.assign(process.env, {
            NODE_ENV: "production",
            UPSTASH_REDIS_REST_URL: "https://redis.example.test",
            UPSTASH_REDIS_REST_TOKEN: "test",
        });
        const existing = { url: "https://example.test/legacy.webp", alt: { en: "Existing", he: "", ar: "" } };
        let images = [existing];
        const failures: string[] = [];
        await uploadPlacePhotos({
            files: [new File([jpeg], "original.jpg", { type: "image/jpeg" })],
            request: async (input, init) => {
                assert.equal(input, "/api/admin/place-images/upload");
                const headers = new Headers(init?.headers);
                headers.set("Origin", `https://${host}`);
                headers.set("Host", "internal-server:3000");
                headers.set("X-Forwarded-Host", host);
                headers.set("X-Forwarded-Proto", "https");
                headers.set("Sec-Fetch-Site", "same-origin");
                return POST(new NextRequest(`http://localhost:3000${input}`, {
                    method: init?.method,
                    body: init?.body,
                    headers,
                }));
            },
            onUploaded: url => { images = appendPlaceImage(images, url, { en: "New", he: "", ar: "" }); },
            onError: (_file, code) => { failures.push(code); },
        });
        assert.deepEqual(failures, []);
        assert.deepEqual(images.map(image => image.url), [existing.url, "https://res.cloudinary.com/test/image/upload/new.webp"]);
        assert.equal(images[0], existing);
        assert.equal(uploads.length, 1);
    });
}
test("uses the external Host and HTTPS protocol when NextRequest has an internal URL", async () => {
    const response = await POST(new NextRequest("http://localhost:3000/api/admin/place-images/upload", {
        method: "POST", body: imageForm(), headers: {
            "X-Requested-With": "PlaceForm", Origin: "https://www.golanwiki.com",
            Host: "www.golanwiki.com", "X-Forwarded-Proto": "https", "Sec-Fetch-Site": "same-origin",
        },
    }));
    assert.equal(response.status, 200);
});
test("rejects an Origin that differs from the external host or HTTPS scheme", async () => {
    await expectError(request(imageForm(), {
        Origin: "https://attacker.test", "X-Forwarded-Host": "www.golanwiki.com", "X-Forwarded-Proto": "https",
    }), 400, "INVALID_REQUEST");
    await expectError(request(imageForm(), {
        Origin: "http://www.golanwiki.com", "X-Forwarded-Host": "www.golanwiki.com", "X-Forwarded-Proto": "https",
    }), 400, "INVALID_REQUEST");
    await expectError(request(imageForm(), { Origin: "null" }), 400, "INVALID_REQUEST");
});
test("rejects missing, empty, text and multiple image fields", async () => {
    await expectError(request(new FormData()), 400, "IMAGE_REQUIRED");
    await expectError(request(imageForm(new Uint8Array())), 400, "IMAGE_REQUIRED");
    const text = new FormData(); text.append("image", "https://example.test/file.jpg");
    await expectError(request(text), 400, "INVALID_REQUEST");
    const multiple = imageForm(); multiple.append("image", new Blob([jpeg]), "second.jpg");
    await expectError(request(multiple), 400, "INVALID_REQUEST");
    const otherFile = imageForm(); otherFile.append("extra", new Blob([jpeg]), "extra.jpg");
    await expectError(request(otherFile), 400, "INVALID_REQUEST");
});
test("rejects malformed multipart bodies", async () => {
    await expectError(request("broken", { "Content-Type": "multipart/form-data; boundary=missing" }), 400, "INVALID_REQUEST");
    await expectError(request("{}", { "Content-Type": "application/json" }), 400, "INVALID_REQUEST");
});
test("matches MIME to full format signatures", async () => {
    await expectError(request(imageForm(png, "image/jpeg")), 400, "INVALID_IMAGE_FORMAT");
    await expectError(request(imageForm(jpeg, "image/gif")), 400, "INVALID_IMAGE_FORMAT");
    await expectError(request(imageForm(new Uint8Array([0x89, 0x50, 0x4e, 0x47]), "image/png")), 400, "INVALID_IMAGE_FORMAT");
    await expectError(request(imageForm(new Uint8Array([1, 2, 3]), "image/jpeg")), 400, "INVALID_IMAGE_FORMAT");
});
test("enforces file and body limits even without Content-Length", async () => {
    const oversizedFile = new Uint8Array(4 * 1024 * 1024 + 1); oversizedFile.set(jpeg);
    const fileRequest = request(imageForm(oversizedFile));
    assert.equal(fileRequest.headers.get("content-length"), null);
    await expectError(fileRequest, 413, "PLACE_IMAGE_TOO_LARGE");
    const oversizedBody = new Uint8Array(4 * 1024 * 1024 + 64 * 1024 + 1);
    await expectError(request(oversizedBody, { "Content-Type": "multipart/form-data; boundary=test" }), 413, "PLACE_IMAGE_TOO_LARGE");
    await expectError(request(imageForm(), { "Content-Length": String(4 * 1024 * 1024 + 64 * 1024 + 1) }), 413, "PLACE_IMAGE_TOO_LARGE");
});
test("stops and cancels an oversized streaming multipart body", async () => {
    let chunksRead = 0;
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
        pull(controller) {
            chunksRead++;
            controller.enqueue(new Uint8Array(64 * 1024));
        },
        cancel() { cancelled = true; },
    });
    await expectError(request(body, { "Content-Type": "multipart/form-data; boundary=test" }), 413, "PLACE_IMAGE_TOO_LARGE");
    assert.equal(cancelled, true);
    assert.ok(chunksRead <= 67, `stream consumed ${chunksRead} chunks`);
});
test("accepts an image exactly at the file limit", async () => {
    const bytes = new Uint8Array(4 * 1024 * 1024); bytes.set(jpeg);
    const response = await POST(request(imageForm(bytes)));
    assert.equal(response.status, 200);
});
test("fails closed without production Redis configuration", async () => {
    Object.assign(process.env, { NODE_ENV: "production" });
    await expectError(request(), 503, "UPLOAD_UNAVAILABLE");
    assert.equal(limiterRules, undefined);
});
test("handles unavailable and denied sensitive limits", async () => {
    limiter = { allowed: false, remaining: 0, resetAt: Date.now() + 60_000, reason: "configuration" };
    await expectError(request(), 503, "UPLOAD_UNAVAILABLE");
    limiter.reason = "limited";
    const response = await expectError(request(), 429, "RATE_LIMITED");
    assert.ok(Number(response.headers.get("retry-after")) > 0);
    assert.deepEqual(limiterRules, [{ name: "admin-place-image-upload", key: "admin-database-id", maxRequests: 60, windowSeconds: 3600 }]);
});
test("returns unavailable when the rate limiter throws", async () => {
    limiterError = true;
    await expectError(request(), 503, "UPLOAD_UNAVAILABLE");
});
for (const prefix of ["UPSTASH_REDIS_REST", "KV_REST_API"]) {
    test(`accepts production uploads with ${prefix} limiter configuration`, async () => {
        Object.assign(process.env, { NODE_ENV: "production" });
        process.env[`${prefix}_URL`] = "https://redis.example.test";
        process.env[`${prefix}_TOKEN`] = "test";
        const response = await POST(request());
        assert.equal(response.status, 200);
        assert.ok(limiterRules);
    });
}
test("fails gracefully with incomplete Cloudinary configuration", async () => {
    cloudConfig = { cloud_name: "test", api_key: "test" };
    await expectError(request(), 503, "UPLOAD_UNAVAILABLE");
});
for (const [mime, bytes] of [["image/jpeg", jpeg], ["image/png", png], ["image/webp", webp]] as const) {
    test(`uploads ${mime} as a bounded unique WebP and returns only its secure URL`, async () => {
        const response = await POST(request(imageForm(bytes, mime), { Origin: "https://example.test" }));
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { success: true, imageUrl: uploadResult.secure_url });
        assert.equal(uploads.length, 1);
        assert.ok(uploads[0].data.startsWith(`data:${mime};base64,`));
        const options = uploads[0].options;
        assert.equal(options.resource_type, "image");
        assert.equal(options.folder, "golan-places/admin");
        assert.equal(options.overwrite, false);
        assert.equal(options.format, "webp");
        assert.equal(options.unique_filename, true);
        assert.deepEqual(options.transformation, [{ width: 2560, height: 2560, crop: "limit", quality: "auto" }]);
        assert.equal(options.public_id, undefined);
    });
}
test("returns a stable error on upstream failure or insecure result without leaking details", async () => {
    uploadError = true;
    let response = await POST(request());
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { success: false, errorCode: "UPLOAD_FAILED" });
    uploadError = false;
    uploadResult = { secure_url: "http://example.test/image.webp" };
    response = await POST(request());
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { success: false, errorCode: "UPLOAD_FAILED" });
});
