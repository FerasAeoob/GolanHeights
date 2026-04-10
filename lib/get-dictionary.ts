import { cache } from 'react';

const dictionaries = {
    en: () => import('../dictionaries/en.json').then((module) => module.default),
    ar: () => import('../dictionaries/ar.json').then((module) => module.default),
    he: () => import('../dictionaries/he.json').then((module) => module.default),
};

// 1. This creates the "Value" (the object)
export const locales = ['en', 'ar', 'he'] as const;

// 2. This creates the "Type" ('en' | 'ar' | 'he')
export type Locale = (typeof locales)[number];

// cache() memoizes per request — layout + page share one import instead of two
export const getDictionary = cache(
    async (locale: Locale) => dictionaries[locale]?.() ?? dictionaries.en()
);