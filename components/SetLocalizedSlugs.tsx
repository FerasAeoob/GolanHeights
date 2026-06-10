'use client';

import { useEffect } from 'react';
import { useLocalizedSlugs } from '@/app/LocalizedSlugContext';

interface SetLocalizedSlugsProps {
    slugs: {
        en: string;
        he?: string;
        ar?: string;
    };
}

export default function SetLocalizedSlugs({ slugs }: SetLocalizedSlugsProps) {
    const { setLocalizedSlugs } = useLocalizedSlugs();

    useEffect(() => {
        setLocalizedSlugs(slugs);
        return () => {
            setLocalizedSlugs(null);
        };
    }, [slugs, setLocalizedSlugs]);

    return null;
}
