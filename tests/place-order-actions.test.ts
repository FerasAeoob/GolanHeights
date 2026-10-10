import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test, { beforeEach } from "node:test";

const require = createRequire(import.meta.url);
require("./helpers/load-ts.cjs");
const loader = require("node:module") as { _load: (id: string, parent: unknown, main: boolean) => unknown };
const originalLoad = loader._load;
type Row = { _id: string; title: { en: string }; hidden: boolean; createdAt: Date; publicOrder?: number; publicOrderRevision?: string };
const a = "a".repeat(24), b = "b".repeat(24), c = "c".repeat(24);
let rows: Row[];
let authError = "";
let allowed = true;
let failAfterWrite = false;
let sessions = 0;
let pending: Row[] | undefined;
let invalidated: string[];
let updateOptions: Record<string, unknown>;
const session = {
    async withTransaction<T>(fn: () => Promise<T>) {
        pending = structuredClone(rows);
        try {
            const value = await fn();
            rows = pending;
            return value;
        } finally { pending = undefined; }
    },
    async endSession() {},
};
loader._load = function(id, parent, main) {
    if (id === "@/lib/permissions") return { requireRole: async (roles: string[]) => {
        assert.deepEqual(roles, ["admin"]);
        if (authError) throw new Error(authError);
        return { _id: "admin", role: "admin" };
    } };
    if (id === "@/lib/rate-limit") return { checkSensitiveRateLimits: async () => ({ allowed }), rateLimitKey: () => "key" };
    if (id === "@/lib/mongodb") return { __esModule: true, default: async () => ({ startSession: async () => { sessions++; return session; } }) };
    if (id === "next/cache") return { revalidatePath: (path: string) => invalidated.push(path) };
    if (id === "@/database/place.model") return { __esModule: true, default: {
        find() {
            let inTransaction = false;
            const query = {
                select() { return query; },
                sort() { return query; },
                session(value: unknown) { inTransaction = Boolean(value); return query; },
                async lean() { return structuredClone(inTransaction ? pending : rows); },
            };
            return query;
        },
        async bulkWrite(ops: { updateOne: { filter: { _id: string }; update: { $set: Partial<Row> } } }[], options: Record<string, unknown>) {
            assert.equal(options.session, session);
            updateOptions = options;
            let matchedCount = 0;
            for (const op of ops) {
                const row = pending!.find(row => row._id === op.updateOne.filter._id);
                if (row) { Object.assign(row, op.updateOne.update.$set); matchedCount++; }
                if (failAfterWrite) throw new Error("write failed");
            }
            return { matchedCount };
        },
    } };
    return originalLoad.call(this, id, parent, main);
};
const { getPlaceOrderAction, savePlaceOrderAction } = require("../app/actions/place-order.ts") as typeof import("../app/actions/place-order");
loader._load = originalLoad;

beforeEach(() => {
    rows = [a, b].map((_id, index) => ({ _id, title: { en: _id }, hidden: false, createdAt: new Date(1000 - index) }));
    authError = ""; allowed = true; failAfterWrite = false; sessions = 0; invalidated = [];
});

async function snapshot() {
    const result = await getPlaceOrderAction();
    assert.ok("revision" in result);
    return result;
}

test("anonymous and non-admin callers cannot read or save order", async () => {
    for (const error of ["Unauthorized", "Forbidden"]) {
        authError = error;
        assert.deepEqual(await getPlaceOrderAction(), { errorCode: error.toUpperCase() });
        assert.deepEqual(await savePlaceOrderAction({}), { errorCode: error.toUpperCase() });
    }
    assert.equal(sessions, 0);
});

test("save persists order and revision without modifying content or timestamps", async () => {
    const before = structuredClone(rows);
    const { revision } = await snapshot();
    const result = await savePlaceOrderAction({ ids: [b, a], revision });
    assert.ok("success" in result && result.success);
    assert.deepEqual(rows.map(row => row.publicOrder), [1, 0]);
    assert.deepEqual(rows.map(row => [row.title, row.createdAt]), before.map(row => [row.title, row.createdAt]));
    assert.equal(updateOptions.timestamps, false);
    assert.equal((await snapshot()).revision, result.revision);
    assert.notEqual(result.revision, revision);
    assert.ok(invalidated.includes("/[lang]/places"));
});

test("rejects stale admin edits, changed membership, duplicates, and incomplete orders", async () => {
    const { revision } = await snapshot();
    assert.deepEqual(await savePlaceOrderAction({ ids: [a, a], revision }), { errorCode: "VALIDATION_FAILED" });
    assert.deepEqual(await savePlaceOrderAction({ ids: [a], revision }), { errorCode: "ORDER_CONFLICT" });
    assert.deepEqual(await savePlaceOrderAction({ ids: [a, c], revision }), { errorCode: "ORDER_CONFLICT" });
    await savePlaceOrderAction({ ids: [b, a], revision });
    assert.deepEqual(await savePlaceOrderAction({ ids: [a, b], revision }), { errorCode: "ORDER_CONFLICT" });
    const current = await snapshot();
    rows.push({ _id: c, title: { en: "New" }, hidden: false, createdAt: new Date() });
    assert.deepEqual(await savePlaceOrderAction({ ids: [b, a], revision: current.revision }), { errorCode: "ORDER_CONFLICT" });
});

test("partial write failure rolls back and does not invalidate the public page", async () => {
    const { revision } = await snapshot();
    const before = structuredClone(rows);
    failAfterWrite = true;
    assert.deepEqual(await savePlaceOrderAction({ ids: [b, a], revision }), { errorCode: "UNKNOWN_ERROR" });
    assert.deepEqual(rows, before);
    assert.deepEqual(invalidated, []);
});

test("unavailable rate limiter blocks writes before opening a transaction", async () => {
    const { revision } = await snapshot();
    const previousSessions = sessions;
    allowed = false;
    assert.deepEqual(await savePlaceOrderAction({ ids: [b, a], revision }), { errorCode: "RATE_LIMITED" });
    assert.equal(sessions, previousSessions);
});

test("missing distributed limiter configuration fails closed in production", async () => {
    const environment = { ...process.env };
    const { revision } = await snapshot();
    const previousSessions = sessions;
    try {
        Object.assign(process.env, { NODE_ENV: "production" });
        for (const key of ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN"]) delete process.env[key];
        assert.deepEqual(await savePlaceOrderAction({ ids: [b, a], revision }), { errorCode: "UNKNOWN_ERROR" });
        assert.equal(sessions, previousSessions);
    } finally { process.env = environment; }
});
