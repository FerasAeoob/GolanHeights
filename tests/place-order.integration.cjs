/* eslint-disable @typescript-eslint/no-require-imports */
// Optional real-MongoDB verification. MEMORY_SERVER_MODULE points at a temporary
// mongodb-memory-server install; the test never reads the application's DB URI.
const assert = require('node:assert/strict');
const { test, before, after, beforeEach } = require('node:test');
const { MongoMemoryReplSet } = require(process.env.MEMORY_SERVER_MODULE || 'mongodb-memory-server');
require('./helpers/load-ts.cjs');
let server, mongoose, Place, readPlaceOrder, persistPlaceOrder, getPlacesPageSort;
before(async () => {
    server = await MongoMemoryReplSet.create({ replSet: { count: 1 }, instanceOpts: [{ ip: '127.0.0.1' }] });
    process.env.MONGODB_URI = server.getUri('place_order_isolated_test');
    mongoose = require('mongoose');
    Place = require('../database/place.model.ts').default;
    ({ readPlaceOrder, persistPlaceOrder } = require('../lib/db/place-order.ts'));
    ({ getPlacesPageSort } = require('../lib/place-order.ts'));
    await require('../lib/mongodb.ts').default();
    await Place.init();
});
after(async () => { if (mongoose) await mongoose.disconnect(); if (server) await server.stop(); });
beforeEach(async () => { await Place.deleteMany({}); });
function place(index, extra = {}) {
    return {
        title: { en: `Place ${index}`, ar: `مكان ${index}`, he: `מקום ${index}` },
        slug: { en: `place-${index}`, ar: `place-ar-${index}`, he: `place-he-${index}` },
        category: 'food-drink', images: [{ url: 'https://example.test/photo.jpg', alt: { en: 'Photo' } }],
        location: { lat: 33, lng: 35, name: { en: 'Golan', ar: 'الجولان', he: 'גולן' } },
        createdAt: new Date(1700000000000 + index * 1000), ...extra,
    };
}
const ids = records => records.map(record => record._id.toString());
async function seed(count = 3) { return Place.insertMany(Array.from({length:count}, (_,index)=>place(index))); }

test('real DB: legacy order, manual persistence, new-place default, filters, and explicit rating sort', async () => {
    const records = await seed();
    const original = ids(records);
    const initial = await readPlaceOrder();
    assert.deepEqual(initial.places.map(p=>p.id), [...original].reverse());
    const revision = await persistPlaceOrder(original, initial.revision);
    assert.deepEqual((await readPlaceOrder()).places.map(p=>p.id),original);
    assert.equal((await readPlaceOrder()).revision,revision);
    const newest = await Place.create(place(10));
    assert.equal(newest.publicOrder,undefined);
    assert.deepEqual(ids(await Place.find({}).sort(getPlacesPageSort()).lean()),[newest.id,...original]);
    assert.deepEqual(ids(await Place.find({category:'food-drink','title.en':{$regex:'Place [12]$'}}).sort(getPlacesPageSort()).lean()),original.slice(1));
    await Place.updateOne({_id:records[2]._id},{$set:{averageRating:5}});
    assert.equal((await Place.find({}).sort(getPlacesPageSort('top-rated')).lean())[0]._id.toString(),original[2]);
});

test('real DB: simultaneous admins commit exactly one order; stale save is rejected', async () => {
    const records = await seed();
    const initial = await readPlaceOrder();
    const original = ids(records);
    const results = await Promise.allSettled([
        persistPlaceOrder(original,initial.revision),
        persistPlaceOrder([original[1],original[0],original[2]],initial.revision),
    ]);
    assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
    const rejected = results.find(result=>result.status==='rejected');
    assert.equal(rejected.reason.message,'ORDER_CONFLICT');
});

test('real DB: failure after an actual write rolls back every position', async () => {
    const records = await seed();
    const initial = await readPlaceOrder();
    const bulkWrite = Place.bulkWrite;
    Place.bulkWrite = async function(operations,options) {
        await bulkWrite.call(this,operations.slice(0,1),options);
        throw new Error('INJECTED_WRITE_FAILURE');
    };
    try { await assert.rejects(persistPlaceOrder(ids(records),initial.revision),/INJECTED_WRITE_FAILURE/); }
    finally { Place.bulkWrite = bulkWrite; }
    assert.deepEqual(await readPlaceOrder(),initial);
    assert.equal(await Place.countDocuments({publicOrder:{$exists:true}}),0);
});

test('real DB: all records are ordered before limit/skip, including hidden records', async () => {
    const records = await seed(110);
    const original = ids(records);
    const initial = await readPlaceOrder();
    await persistPlaceOrder(original,initial.revision);
    assert.deepEqual(ids(await Place.find({}).sort(getPlacesPageSort()).limit(100).lean()),original.slice(0,100));
    assert.deepEqual(ids(await Place.find({}).sort(getPlacesPageSort()).skip(100).limit(10).lean()),original.slice(100));
    await Place.updateOne({_id:records[0]._id},{$set:{hidden:true}});
    assert.equal((await readPlaceOrder()).places[0].id,original[0]);
    assert.equal((await Place.find({hidden:{$ne:true}}).sort(getPlacesPageSort()).lean())[0]._id.toString(),original[1]);
});

test('real DB: changed membership and ABA order changes invalidate old snapshots', async () => {
    const records = await seed();
    const original = ids(records);
    const initial = await readPlaceOrder();
    const first = await persistPlaceOrder(original,initial.revision);
    const second = await persistPlaceOrder([...original].reverse(),first);
    await persistPlaceOrder(original,second);
    await assert.rejects(persistPlaceOrder(original,first),/ORDER_CONFLICT/);
    const current = await readPlaceOrder();
    await Place.deleteOne({_id:records[0]._id});
    await assert.rejects(persistPlaceOrder(original,current.revision),/ORDER_CONFLICT/);
});
