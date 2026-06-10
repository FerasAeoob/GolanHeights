type LocalizedSlugs = {
    en: string;
    he?: string;
    ar?: string;
};

export function getLocalizedPathname(
    currentPathname: string,
    targetLang: 'en' | 'he' | 'ar',
    searchParams?: string | URLSearchParams | Record<string, string>,
    hash?: string,
    localizedSlugs?: LocalizedSlugs | null
): string {
    const LANGS = ['en', 'he', 'ar'] as const;
    const segments = currentPathname.split('/');
    
    // 1. Strip the current language prefix if one exists
    if (segments.length > 1 && LANGS.includes(segments[1] as 'en' | 'he' | 'ar')) {
        segments.splice(1, 1);
    }
    
    // 2. Handle place details localized slug conversion
    // After stripping language prefix, the place detail path is /places/[slug]
    if (segments[1] === 'places' && segments[2] && localizedSlugs) {
        const targetSlug = localizedSlugs[targetLang] || localizedSlugs.en;
        if (targetSlug) {
            // Encode the slug to keep URL safe (e.g. Hebrew/Arabic characters)
            segments[2] = encodeURIComponent(decodeURIComponent(targetSlug));
        }
    }
    
    // Reconstruct the pathname
    const cleanPathname = segments.join('/') || '/';
    
    // 3. Add prefix for the target language (except English)
    let finalPathname = '';
    if (targetLang === 'en') {
        finalPathname = cleanPathname;
    } else {
        finalPathname = cleanPathname === '/' ? `/${targetLang}` : `/${targetLang}${cleanPathname}`;
    }
    
    // 4. Handle query parameters
    let finalQuery = '';
    if (searchParams) {
        const searchStr = typeof searchParams === 'string'
            ? searchParams
            : searchParams.toString();
        if (searchStr) {
            finalQuery = searchStr.startsWith('?') ? searchStr : `?${searchStr}`;
        }
    } else if (typeof window !== 'undefined') {
        const searchStr = window.location.search;
        if (searchStr) {
            finalQuery = searchStr;
        }
    }
    
    // 5. Handle hash fragment
    let finalHash = '';
    if (hash) {
        finalHash = hash.startsWith('#') ? hash : `#${hash}`;
    } else if (typeof window !== 'undefined') {
        const hashStr = window.location.hash;
        if (hashStr) {
            finalHash = hashStr;
        }
    }
    
    return `${finalPathname}${finalQuery}${finalHash}`;
}
