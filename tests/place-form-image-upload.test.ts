import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);

function loadUploads() {
    try {
        return require('../components/admin/place-image-upload.ts') as typeof import('../components/admin/place-image-upload');
    } catch (error) {
        assert.fail(`PlaceForm upload behavior is unavailable: ${String(error)}`);
    }
}

test('manual URLs and uploads append to the same ordered image collection', async () => {
    const { appendPlaceImage, uploadPlacePhotos } = loadUploads();
    const existing = { url: 'https://res.cloudinary.com/legacy/image/upload/existing.webp', alt: { en: 'Existing', he: '', ar: '' } };
    const original = [existing];
    let images = appendPlaceImage(original, ' https://example.com/manual.jpg ', { en: ' Manual ', he: '', ar: '' });

    await uploadPlacePhotos({
        files: [new File(['photo'], 'original.jpg', { type: 'image/jpeg' })],
        request: async (input, init) => {
            assert.equal(input, '/api/admin/place-images/upload');
            assert.equal(init?.method, 'POST');
            assert.deepEqual(init?.headers, { 'X-Requested-With': 'PlaceForm' });
            assert.ok(init?.body instanceof FormData);
            assert.equal((init.body.get('image') as File).name, 'original.jpg');
            return Response.json({ success: true, imageUrl: 'https://res.cloudinary.com/demo/image/upload/new.webp' });
        },
        onUploaded: url => { images = appendPlaceImage(images, url, { en: 'Place image', he: 'תמונת מקום', ar: 'صورة المكان' }); },
        onError: () => assert.fail('valid upload failed'),
    });

    assert.deepEqual(images.map(image => image.url), [existing.url, 'https://example.com/manual.jpg', 'https://res.cloudinary.com/demo/image/upload/new.webp']);
    assert.deepEqual(images[1].alt, { en: 'Manual', he: '', ar: '' });
    assert.deepEqual(original, [existing]);
    assert.equal(images[0], existing);
});

test('a failed file retains successful uploads and continues in selection order', async () => {
    const { uploadPlacePhotos } = loadUploads();
    const uploaded: string[] = [];
    const failures: [string, string][] = [];
    const files = ['one.jpg', 'failed.png', 'three.webp'].map(name => new File(['photo'], name, { type: name.endsWith('.png') ? 'image/png' : name.endsWith('.webp') ? 'image/webp' : 'image/jpeg' }));
    await uploadPlacePhotos({
        files,
        request: async (_input, init) => {
            const file = (init?.body as FormData).get('image') as File;
            if (file.name === 'failed.png') return Response.json({ success: false, errorCode: 'UPLOAD_FAILED' }, { status: 502 });
            return Response.json({ success: true, imageUrl: `https://example.com/${file.name}.webp` });
        },
        onUploaded: url => uploaded.push(url),
        onError: (file, code) => failures.push([file.name, code]),
    });
    assert.deepEqual(uploaded, ['https://example.com/one.jpg.webp', 'https://example.com/three.webp.webp']);
    assert.deepEqual(failures, [['failed.png', 'UPLOAD_FAILED']]);
});

test('invalid MIME and oversized files fail before sending a request', async () => {
    const { uploadPlacePhotos } = loadUploads();
    const failures: string[] = [];
    await uploadPlacePhotos({
        files: [new File(['text'], 'fake.svg', { type: 'image/svg+xml' }), new File([new Uint8Array(4 * 1024 * 1024 + 1)], 'large.jpg', { type: 'image/jpeg' })],
        request: async () => { assert.fail('invalid file was sent'); },
        onUploaded: () => assert.fail('invalid file was appended'),
        onError: (_file, code) => failures.push(code),
    });
    assert.deepEqual(failures, ['INVALID_IMAGE_FORMAT', 'PLACE_IMAGE_TOO_LARGE']);
});

test('network errors and malformed success responses never append image entries', async () => {
    const { uploadPlacePhotos } = loadUploads();
    for (const request of [
        async () => { throw new Error('network failure'); },
        async () => new Response('not JSON', { status: 502 }),
        async () => Response.json({ success: true }),
        async () => Response.json({ success: true, imageUrl: 'javascript:alert(1)' }),
    ]) {
        const failures: string[] = [];
        await uploadPlacePhotos({
            files: [new File(['photo'], 'one.jpg', { type: 'image/jpeg' })], request,
            onUploaded: () => assert.fail('malformed image entry was appended'),
            onError: (_file, code) => failures.push(code),
        });
        assert.deepEqual(failures, ['UPLOAD_FAILED']);
    }
});
