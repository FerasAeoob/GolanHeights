export interface PlaceFormImage {
    url: string;
    alt: { en: string; he: string; ar: string };
}

export function appendPlaceImage(
    images: PlaceFormImage[],
    url: string,
    alt: PlaceFormImage['alt'],
): PlaceFormImage[] {
    if (!url.trim()) return images;
    return [...images, {
        url: url.trim(),
        alt: { en: alt.en.trim() || 'Place image', he: alt.he.trim(), ar: alt.ar.trim() },
    }];
}

interface UploadPhotosOptions {
    files: File[];
    request?: typeof fetch;
    onUploaded: (url: string) => void;
    onError: (file: File, errorCode: string) => void;
}

export async function uploadPlacePhotos({
    files, request = fetch, onUploaded, onError,
}: UploadPhotosOptions): Promise<void> {
    // One request per file keeps failures independent and preserves selection order.
    for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            onError(file, 'INVALID_IMAGE_FORMAT');
            continue;
        }
        if (file.size > 4 * 1024 * 1024) {
            onError(file, 'PLACE_IMAGE_TOO_LARGE');
            continue;
        }
        try {
            const body = new FormData();
            body.append('image', file);
            const response = await request('/api/admin/place-images/upload', {
                method: 'POST',
                headers: { 'X-Requested-With': 'PlaceForm' },
                body,
            });
            const result: unknown = await response.json();
            if (!result || typeof result !== 'object') throw new Error('UPLOAD_FAILED');
            const data = result as { success?: unknown; imageUrl?: unknown; errorCode?: unknown };
            if (!response.ok || data.success !== true) {
                onError(file, typeof data.errorCode === 'string' ? data.errorCode : 'UPLOAD_FAILED');
                continue;
            }
            if (typeof data.imageUrl !== 'string' || new URL(data.imageUrl).protocol !== 'https:') {
                throw new Error('UPLOAD_FAILED');
            }
            onUploaded(data.imageUrl);
        } catch {
            onError(file, 'UPLOAD_FAILED');
        }
    }
}
