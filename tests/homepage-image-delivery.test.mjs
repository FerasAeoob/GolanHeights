import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import NextImage from "next/image.js";
import ImageConfigContextModule from "next/dist/shared/lib/image-config-context.shared-runtime.js";
import ImageConfigModule from "next/dist/shared/lib/image-config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");
const Image = typeof NextImage === "function" ? NextImage : NextImage.default;
const { ImageConfigContext } = ImageConfigContextModule;
const { imageConfigDefault } = ImageConfigModule;

function collectTsxFiles(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const absolutePath = path.join(directory, entry.name);
        if (entry.isDirectory()) return collectTsxFiles(absolutePath);
        return entry.isFile() && entry.name.endsWith(".tsx") ? [absolutePath] : [];
    });
}

function imageElement(source) {
    const match = source.match(/<Image\b[\s\S]*?\/>/);
    assert.ok(match, "expected a next/image element");
    return match[0];
}

test("targeted homepage sources declare the quality and loading boundary", () => {
    const config = read("next.config.ts");
    const qualities = config.match(/qualities\s*:\s*\[([^\]]+)\]/);
    assert.ok(qualities, "images.qualities must be configured");

    const configuredQualities = qualities[1].match(/\d+/g)?.map(Number) ?? [];
    assert.ok(configuredQualities.includes(60), "quality 60 must be allowed");
    assert.ok(configuredQualities.includes(75), "quality 75 must be allowed");
    assert.ok(configuredQualities.includes(85), "the existing navbar quality 85 must remain allowed");

    const heroImage = imageElement(read("components/homepage/animatedHero.tsx"));
    assert.match(heroImage, /quality=\{60\}/);
    assert.match(heroImage, /\bpreload\b/);
    assert.doesNotMatch(heroImage, /\bpriority\b/);

    const categoryImage = imageElement(read("components/categorycard.tsx"));
    assert.match(categoryImage, /quality=\{60\}/);

    const popupSource = read("components/WeeklyPartnerPopup.tsx");
    const popupImage = imageElement(popupSource);
    assert.match(popupImage, /quality=\{60\}/);
    assert.match(popupImage, /loading="eager"/);
    assert.match(popupImage, /fetchPriority="high"/);
    assert.doesNotMatch(popupImage, /\bpriority\b/);
    assert.doesNotMatch(popupImage, /\bpreload\b/);
    assert.match(popupSource, /if \(!mounted \|\| !shouldRender\) return null/);

    const placeCard = read("components/places/placecard.tsx");
    assert.match(placeCard, /imageQuality\?:\s*60\s*\|\s*75/);
    assert.match(imageElement(placeCard), /quality=\{imageQuality\}/);

    const callers = collectTsxFiles(path.join(root, "app"))
        .filter((file) => readFileSync(file, "utf8").includes("<PlaceCard"));
    const qualityCallers = callers.filter((file) =>
        readFileSync(file, "utf8").includes("imageQuality="),
    );
    const normalizedQualityCallers = qualityCallers
        .map((file) => path.relative(root, file).replaceAll("\\", "/"))
        .sort();

    assert.deepEqual(normalizedQualityCallers, ["app/[lang]/(main)/page.tsx"]);
    assert.match(read("app/[lang]/(main)/page.tsx"), /imageQuality=\{60\}/);
});

test("representative Next Image runtime output preserves the quality boundary", () => {
    assert.ok(Image, "next/image must resolve to a renderable component");

    const renderImage = (props) =>
        renderToStaticMarkup(
            React.createElement(
                ImageConfigContext.Provider,
                { value: { ...imageConfigDefault, qualities: [60, 75, 85] } },
                React.createElement(Image, {
                    src: "/placeholder.jpg",
                    alt: "Representative image",
                    width: 640,
                    height: 400,
                    ...props,
                }),
            ),
        );

    const targeted = renderImage({ quality: 60 });
    assert.match(targeted, /(?:src|srcSet)="[^"]*q=60/);

    const unaffected = renderImage({});
    assert.match(unaffected, /(?:src|srcSet)="[^"]*q=75/);

    const hero = renderImage({ quality: 60, preload: true });
    assert.match(hero, /<link rel="preload" as="image"/);

    const popup = renderImage({
        quality: 60,
        loading: "eager",
        fetchPriority: "high",
    });
    assert.match(popup, /<img[^>]*fetchPriority="high"[^>]*loading="eager"/);
});
