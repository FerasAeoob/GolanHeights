import { createHash, randomUUID } from "node:crypto";
import type { ClientSession } from "mongoose";
import Place from "@/database/place.model";
import connectDB from "@/lib/mongodb";
import { getPlacesPageSort, type PlaceOrderItem } from "@/lib/place-order";

type OrderRecord = {
    _id: { toString(): string };
    title: PlaceOrderItem["title"];
    hidden?: boolean;
    publicOrder?: number;
    publicOrderRevision?: string;
    createdAt?: Date;
};

function revisionFor(records: OrderRecord[]): string {
    const values = records.map(record => [
        record._id.toString(), record.publicOrder ?? null,
        record.publicOrderRevision ?? null, record.createdAt ?? null,
    ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    return createHash("sha256").update(JSON.stringify(values)).digest("hex");
}

async function readRecords(session: ClientSession): Promise<OrderRecord[]> {
    return Place.find({})
        .select("_id title hidden publicOrder publicOrderRevision createdAt")
        .sort(getPlacesPageSort())
        .session(session)
        .lean<OrderRecord[]>();
}

export async function readPlaceOrder() {
    const db = await connectDB();
    const session = await db.startSession();
    try {
        // A snapshot keeps this list/revision consistent even while another admin saves.
        return await session.withTransaction(async () => {
            const records = await readRecords(session);
            return {
                revision: revisionFor(records),
                places: records.map(record => ({
                    id: record._id.toString(), title: record.title, hidden: record.hidden === true,
                })),
            };
        }, { readConcern: { level: "snapshot" } });
    } finally {
        await session.endSession();
    }
}

export async function persistPlaceOrder(ids: string[], revision: string): Promise<string> {
    const db = await connectDB();
    const session = await db.startSession();
    try {
        return await session.withTransaction(async () => {
            const records = await readRecords(session);
            const existing = new Set(records.map(record => record._id.toString()));
            if (revisionFor(records) !== revision || ids.length !== existing.size || ids.some(id => !existing.has(id))) {
                throw new Error("ORDER_CONFLICT");
            }
            // All records get a fresh revision, including unchanged positions. This
            // creates overlapping writes so concurrent saves conflict and retry; the
            // retried snapshot then rejects the stale client revision (including ABA).
            const publicOrderRevision = randomUUID();
            if (ids.length) {
                const result = await Place.bulkWrite(ids.map((id, publicOrder) => ({
                    updateOne: {
                        filter: { _id: id },
                        update: { $set: { publicOrder, publicOrderRevision } },
                        timestamps: false,
                    },
                })), { session, ordered: true, timestamps: false });
                if (result.matchedCount !== ids.length) throw new Error("ORDER_CONFLICT");
            }
            const positions = new Map(ids.map((id, index) => [id, index]));
            return revisionFor(records.map(record => ({
                ...record, publicOrder: positions.get(record._id.toString()), publicOrderRevision,
            })));
        }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
    } finally {
        await session.endSession();
    }
}
