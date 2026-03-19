import 'server-only';

const dictionaries = {
    en: () => import('../dictionaries/en.json').then((module) => module.default),
    ar: () => import('../dictionaries/ar.json').then((module) => module.default),
    he: () => import('../dictionaries/he.json').then((module) => module.default),
};

export const getDictionary = async (locale: 'en' | 'ar' | 'he') => {
    // Fallback to English if the locale is missing
    return dictionaries[locale]?.() ?? dictionaries.en();
};