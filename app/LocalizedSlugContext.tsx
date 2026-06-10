'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type LocalizedSlugs = {
    en: string;
    he?: string;
    ar?: string;
};

interface LocalizedSlugContextType {
    localizedSlugs: LocalizedSlugs | null;
    setLocalizedSlugs: (slugs: LocalizedSlugs | null) => void;
}

export const LocalizedSlugContext = createContext<LocalizedSlugContextType | undefined>(undefined);

export function LocalizedSlugProvider({ children }: { children: ReactNode }) {
    const [localizedSlugs, setLocalizedSlugs] = useState<LocalizedSlugs | null>(null);

    return (
        <LocalizedSlugContext.Provider value={{ localizedSlugs, setLocalizedSlugs }}>
            {children}
        </LocalizedSlugContext.Provider>
    );
}

export function useLocalizedSlugs() {
    const context = useContext(LocalizedSlugContext);
    if (!context) {
        throw new Error('useLocalizedSlugs must be used within a LocalizedSlugProvider');
    }
    return context;
}
