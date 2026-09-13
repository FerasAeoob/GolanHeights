import type { Dictionary } from '@/lib/get-dictionary';
import { PLACE_TAGS, getPublicPlaceTags } from '@/lib/place-tags';

interface PlaceTagsProps {
    tags: unknown;
    dictionary: Pick<Dictionary['placeTags'], 'sectionLabel' | 'labels'>;
}

export default function PlaceTags({ tags, dictionary }: PlaceTagsProps) {
    const publicTags = getPublicPlaceTags(tags);

    if (publicTags.length === 0) {
        return null;
    }

    return (
        <ul
            aria-label={dictionary.sectionLabel}
            className="flex flex-wrap gap-2 text-sm text-slate-700"
        >
            {publicTags.map((key) => {
                const definition = PLACE_TAGS[key];
                const Icon = definition.icon;

                return (
                    <li
                        key={key}
                        className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3! py-1.5!"
                    >
                        <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-700" />
                        <span>{dictionary.labels[key]}</span>
                    </li>
                );
            })}
        </ul>
    );
}
