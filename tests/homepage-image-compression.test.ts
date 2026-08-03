import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript") as typeof import("typescript");
const { default: nextConfig } = require("../next.config.ts") as {
    default: {
        images?: {
            qualities?: number[];
        };
    };
};

type ImageAttributes = Map<string, string | true>;

async function getImageAttributes(filePath: string): Promise<ImageAttributes> {
    const source = await readFile(filePath, "utf8");
    const sourceFile = ts.createSourceFile(
        filePath,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
    );
    const imageElements: import("typescript").JsxSelfClosingElement[] = [];

    function visit(node: import("typescript").Node) {
        if (
            ts.isJsxSelfClosingElement(node)
            && node.tagName.getText(sourceFile) === "Image"
        ) {
            imageElements.push(node);
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    assert.equal(imageElements.length, 1, `${filePath} must contain one Image`);

    return new Map(imageElements[0].attributes.properties.map((property) => {
        assert.ok(ts.isJsxAttribute(property), "Image props must be JSX attributes");

        const value = property.initializer
            ? property.initializer.getText(sourceFile)
            : true;

        return [property.name.getText(sourceFile), value];
    }));
}

test("allows the homepage, default, and existing navbar qualities", () => {
    assert.deepEqual(nextConfig.images?.qualities, [60, 75, 85]);
});

test("preloads only the quality-60 homepage hero", async () => {
    const hero = await getImageAttributes("components/homepage/animatedHero.tsx");
    const category = await getImageAttributes("components/categorycard.tsx");
    const popup = await getImageAttributes("components/WeeklyPartnerPopup.tsx");

    assert.equal(hero.get("quality"), "{60}");
    assert.equal(hero.get("preload"), true);
    assert.equal(hero.has("priority"), false);
    assert.equal(category.has("preload"), false);
    assert.equal(popup.has("preload"), false);
});

test("keeps quality-60 category cards on default lazy loading", async () => {
    const category = await getImageAttributes("components/categorycard.tsx");

    assert.equal(category.get("quality"), "{60}");
    assert.equal(category.has("preload"), false);
    assert.equal(category.has("priority"), false);
    assert.equal(category.has("loading"), false);
});

test("loads the quality-60 weekly popup eagerly without preloading it", async () => {
    const popup = await getImageAttributes("components/WeeklyPartnerPopup.tsx");

    assert.equal(popup.get("quality"), "{60}");
    assert.equal(popup.has("preload"), false);
    assert.equal(popup.has("priority"), false);
    assert.equal(popup.get("loading"), '"eager"');
    assert.equal(popup.get("fetchPriority"), '"high"');
});
