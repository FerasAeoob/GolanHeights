'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createPlaceAction, updatePlaceAction } from '@/app/actions/places';
import { Trash2, Plus, GripVertical, Image as ImageIcon, Globe, MapPin, Phone, Clock, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { CATEGORY_SLUGS } from '@/lib/categories';

// ─── Types ───────────────────────────────────────────────────────
type Lang = 'en' | 'he' | 'ar';

interface LocalizedString {
    en: string;
    he: string;
    ar: string;
}

interface PlaceImage {
    url: string;
    alt: LocalizedString;
}

interface OpenHour {
    day: number;
    open: number;
    close: number;
    isClosed: boolean;
}

interface PlaceFormData {
    title: LocalizedString;
    description: LocalizedString;
    shortDescription: LocalizedString;
    category: string;
    price: string;
    duration: string;
    mapLink: string;
    open: string;
    images: PlaceImage[];
    openHours: OpenHour[];
    location: {
        lat: number;
        lng: number;
        name: LocalizedString;
    };
    contact: {
        phone: string;
        website: string;
        instagram: string;
    };
    featured: boolean;
}

interface PlaceFormProps {
    mode: 'create' | 'edit';
    initialData?: any;
    lang: string;
}

const EMPTY_FORM: PlaceFormData = {
    title: { en: '', he: '', ar: '' },
    description: { en: '', he: '', ar: '' },
    shortDescription: { en: '', he: '', ar: '' },
    category: CATEGORY_SLUGS[0],
    price: '',
    duration: '',
    mapLink: '',
    open: '',
    images: [],
    openHours: [],
    location: { lat: 0, lng: 0, name: { en: '', he: '', ar: '' } },
    contact: { phone: '', website: '', instagram: '' },
    featured: false,
};

const CATEGORIES = CATEGORY_SLUGS;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TABS: { key: Lang; label: string }[] = [
    { key: 'en', label: 'English' },
    { key: 'he', label: 'עברית' },
    { key: 'ar', label: 'العربية' },
];

// ─── Component ───────────────────────────────────────────────────
export default function PlaceForm({ mode, initialData, lang }: PlaceFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState<Lang>('en');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Merge initialData into form shape
    const [form, setForm] = useState<PlaceFormData>(() => {
        if (!initialData) return EMPTY_FORM;
        return {
            title: { en: initialData.title?.en || '', he: initialData.title?.he || '', ar: initialData.title?.ar || '' },
            description: { en: initialData.description?.en || '', he: initialData.description?.he || '', ar: initialData.description?.ar || '' },
            shortDescription: { en: initialData.shortDescription?.en || '', he: initialData.shortDescription?.he || '', ar: initialData.shortDescription?.ar || '' },
            category: initialData.category || CATEGORY_SLUGS[0],
            price: initialData.price || '',
            duration: initialData.duration || '',
            rating: initialData.rating || '',
            mapLink: initialData.mapLink || '',
            open: initialData.open || '',
            images: initialData.images || [],
            openHours: initialData.openHours || [],
            location: {
                lat: initialData.location?.lat || 0,
                lng: initialData.location?.lng || 0,
                name: {
                    en: initialData.location?.name?.en || '',
                    he: initialData.location?.name?.he || '',
                    ar: initialData.location?.name?.ar || '',
                },
            },
            contact: {
                phone: initialData.contact?.phone || '',
                website: initialData.contact?.website || '',
                instagram: initialData.contact?.instagram || '',
            },
            featured: initialData.featured || false,
        };
    });

    // ─── Helpers ──────────────────────────────────────
    const updateLocalized = (field: 'title' | 'description' | 'shortDescription', lang: Lang, value: string) => {
        setForm(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
    };

    const updateLocationName = (lang: Lang, value: string) => {
        setForm(prev => ({
            ...prev,
            location: { ...prev.location, name: { ...prev.location.name, [lang]: value } },
        }));
    };

    // ─── Image Management ────────────────────────────
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageAlt, setNewImageAlt] = useState({ en: '', he: '', ar: '' });

    const addImage = () => {
        if (!newImageUrl.trim()) return;
        setForm(prev => ({
            ...prev,
            images: [...prev.images, {
                url: newImageUrl.trim(),
                alt: {
                    en: newImageAlt.en.trim() || 'Place image',
                    he: newImageAlt.he.trim(),
                    ar: newImageAlt.ar.trim()
                }
            }]
        }));
        setNewImageUrl('');
        setNewImageAlt({ en: '', he: '', ar: '' });
    };

    const removeImage = (index: number) => {
        setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const moveImage = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= form.images.length) return;
        setForm(prev => {
            const imgs = [...prev.images];
            const [moved] = imgs.splice(fromIndex, 1);
            imgs.splice(toIndex, 0, moved);
            return { ...prev, images: imgs };
        });
    };

    // ─── Opening Hours ───────────────────────────────
    const addOpenHour = () => {
        const usedDays = form.openHours.map(h => h.day);
        const nextDay = [0, 1, 2, 3, 4, 5, 6].find(d => !usedDays.includes(d));
        if (nextDay === undefined) return;

        setForm(prev => ({
            ...prev,
            openHours: [...prev.openHours, { day: nextDay, open: 900, close: 1700, isClosed: false }],
        }));
    };

    const updateOpenHour = (index: number, field: keyof OpenHour, value: any) => {
        setForm(prev => {
            const hours = [...prev.openHours];
            hours[index] = { ...hours[index], [field]: value };
            return { ...prev, openHours: hours };
        });
    };

    const removeOpenHour = (index: number) => {
        setForm(prev => ({ ...prev, openHours: prev.openHours.filter((_, i) => i !== index) }));
    };

    // ─── Submit ──────────────────────────────────────
    const handleSubmit = () => {
        setMessage(null);

        startTransition(async () => {
            try {
                let result: any;

                if (mode === 'create') {
                    result = await createPlaceAction(form);
                } else {
                    result = await updatePlaceAction(initialData._id, form);
                }

                if (result?.error) {
                    // Show detailed validation errors if available
                    let errorText = result.error;
                    if (result.details) {
                        const fieldErrors = Object.entries(result.details)
                            .filter(([key]) => key !== '_errors')
                            .map(([key, val]: [string, any]) => {
                                const msgs = val?._errors?.join(', ') || JSON.stringify(val);
                                return `• ${key}: ${msgs}`;
                            })
                            .join('\n');
                        if (fieldErrors) errorText += '\n' + fieldErrors;
                    }
                    setMessage({ type: 'error', text: errorText });
                } else {
                    setMessage({ type: 'success', text: mode === 'create' ? 'Place created!' : 'Place updated!' });
                    setTimeout(() => router.push(`/${lang}/area-51-sec`), 1000);
                }
            } catch (e: any) {
                setMessage({ type: 'error', text: e.message || 'Something went wrong' });
            }
        });
    };

    // ─── Time Helper ─────────────────────────────────
    const formatMilitaryTime = (val: number) => {
        const h = Math.floor(val / 100).toString().padStart(2, '0');
        const m = (val % 100).toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const parseMilitaryTime = (str: string) => {
        const [h, m] = str.split(':').map(Number);
        return h * 100 + (m || 0);
    };

    // ─── Render ──────────────────────────────────────
    return (
        <div className="p-8 bg-slate-50 min-h-screen text-slate-900 pt-30">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/${lang}/area-51-sec`} className="text-slate-400 hover:text-slate-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold">
                        {mode === 'create' ? 'Add New Place' : `Edit: ${initialData?.title?.en}`}
                    </h1>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-8">

                    {/* ═══════════ SECTION 1: Language Tabs ═══════════ */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="flex border-b border-slate-200">
                            {TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex-1 py-3 px-4 text-sm font-semibold transition-all cursor-pointer
                                        ${activeTab === tab.key
                                            ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                                            : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <Globe className="w-4 h-4 inline mr-2" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Title ({activeTab.toUpperCase()})</label>
                                <input
                                    type="text"
                                    value={form.title[activeTab]}
                                    onChange={e => updateLocalized('title', activeTab, e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter title..."
                                    dir={activeTab === 'ar' || activeTab === 'he' ? 'rtl' : 'ltr'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Short Description ({activeTab.toUpperCase()})</label>
                                <input
                                    type="text"
                                    value={form.shortDescription[activeTab]}
                                    onChange={e => updateLocalized('shortDescription', activeTab, e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Max 255 characters..."
                                    maxLength={255}
                                    dir={activeTab === 'ar' || activeTab === 'he' ? 'rtl' : 'ltr'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Description ({activeTab.toUpperCase()})</label>
                                <textarea
                                    value={form.description[activeTab]}
                                    onChange={e => updateLocalized('description', activeTab, e.target.value)}
                                    rows={5}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                                    placeholder="Write a detailed description..."
                                    dir={activeTab === 'ar' || activeTab === 'he' ? 'rtl' : 'ltr'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Location Name ({activeTab.toUpperCase()})</label>
                                <input
                                    type="text"
                                    value={form.location.name[activeTab]}
                                    onChange={e => updateLocationName(activeTab, e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Katzrin, Golan Heights"
                                    dir={activeTab === 'ar' || activeTab === 'he' ? 'rtl' : 'ltr'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ═══════════ SECTION 2: General Info ═══════════ */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" /> General Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none capitalize"
                                >
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c} className="capitalize">{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Price</label>
                                <input
                                    type="text"
                                    value={form.price}
                                    onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. 150-300 ₪"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Duration</label>
                                <input
                                    type="text"
                                    value={form.duration}
                                    onChange={e => setForm(prev => ({ ...prev, duration: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. 2 hours"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Map Link</label>
                                <input
                                    type="url"
                                    value={form.mapLink}
                                    onChange={e => setForm(prev => ({ ...prev, mapLink: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://maps.google.com/..."
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-6">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    checked={form.featured}
                                    onChange={e => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                                />
                                <label htmlFor="featured" className="text-sm font-semibold text-slate-700 cursor-pointer">⭐ Featured Place</label>
                            </div>
                        </div>

                        {/* Location Coordinates */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.location.lat || ''}
                                    onChange={e => setForm(prev => ({
                                        ...prev,
                                        location: { ...prev.location, lat: parseFloat(e.target.value) || 0 }
                                    }))}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="32.9921"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.location.lng || ''}
                                    onChange={e => setForm(prev => ({
                                        ...prev,
                                        location: { ...prev.location, lng: parseFloat(e.target.value) || 0 }
                                    }))}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="35.8130"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ═══════════ SECTION 3: Contact ═══════════ */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-blue-600" /> Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={form.contact.phone}
                                    onChange={e => setForm(prev => ({
                                        ...prev,
                                        contact: { ...prev.contact, phone: e.target.value }
                                    }))}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="04-696-1234"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Website</label>
                                <input
                                    type="url"
                                    value={form.contact.website}
                                    onChange={e => setForm(prev => ({
                                        ...prev,
                                        contact: { ...prev.contact, website: e.target.value }
                                    }))}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Instagram</label>
                                <input
                                    type="url"
                                    value={form.contact.instagram}
                                    onChange={e => setForm(prev => ({
                                        ...prev,
                                        contact: { ...prev.contact, instagram: e.target.value }
                                    }))}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* ═══════════ SECTION 4: Opening Hours ═══════════ */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" /> Opening Hours
                        </h2>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Quick Text (Fallback)</label>
                            <input
                                type="text"
                                value={form.open}
                                onChange={e => setForm(prev => ({ ...prev, open: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Sun-Thu 10:00 - 22:00, Fri 11:00 - 23:00"
                            />
                            <p className="text-xs text-slate-400 mt-1">Shown when structured hours below are empty</p>
                        </div>

                        <div className="space-y-3">
                            {form.openHours
                                .sort((a, b) => a.day - b.day)
                                .map((hour, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                        <select
                                            value={hour.day}
                                            onChange={e => updateOpenHour(index, 'day', parseInt(e.target.value))}
                                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium"
                                        >
                                            {DAYS.map((d, i) => (
                                                <option key={i} value={i}>{d}</option>
                                            ))}
                                        </select>

                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={hour.isClosed}
                                                onChange={e => updateOpenHour(index, 'isClosed', e.target.checked)}
                                                className="accent-red-500"
                                            />
                                            Closed
                                        </label>

                                        {!hour.isClosed && (
                                            <>
                                                <input
                                                    type="time"
                                                    value={formatMilitaryTime(hour.open)}
                                                    onChange={e => updateOpenHour(index, 'open', parseMilitaryTime(e.target.value))}
                                                    className="px-2 py-2 rounded-lg border border-slate-200 text-sm"
                                                />
                                                <span className="text-slate-400">→</span>
                                                <input
                                                    type="time"
                                                    value={formatMilitaryTime(hour.close)}
                                                    onChange={e => updateOpenHour(index, 'close', parseMilitaryTime(e.target.value))}
                                                    className="px-2 py-2 rounded-lg border border-slate-200 text-sm"
                                                />
                                            </>
                                        )}

                                        <button
                                            onClick={() => removeOpenHour(index)}
                                            className="ml-auto text-red-400 hover:text-red-600 cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                        </div>

                        {form.openHours.length < 7 && (
                            <button
                                onClick={addOpenHour}
                                className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> Add Day
                            </button>
                        )}
                    </div>

                    {/* ═══════════ SECTION 5: Image Gallery Manager ═══════════ */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-blue-600" /> Image Gallery
                        </h2>

                        {/* Existing Images Grid */}
                        {form.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                                {form.images.map((img, index) => (
                                    <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3]">
                                        <Image
                                            src={img.url}
                                            alt={img.alt?.en || 'Place image'}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                        {/* Overlay Controls */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                            <button
                                                onClick={() => moveImage(index, index - 1)}
                                                disabled={index === 0}
                                                className="bg-white/90 text-slate-700 p-1.5 rounded-lg hover:bg-white disabled:opacity-30 cursor-pointer"
                                                title="Move left"
                                            >
                                                <GripVertical className="w-4 h-4 rotate-90" />
                                            </button>
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 cursor-pointer"
                                                title="Delete image"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => moveImage(index, index + 1)}
                                                disabled={index === form.images.length - 1}
                                                className="bg-white/90 text-slate-700 p-1.5 rounded-lg hover:bg-white disabled:opacity-30 cursor-pointer"
                                                title="Move right"
                                            >
                                                <GripVertical className="w-4 h-4 -rotate-90" />
                                            </button>
                                        </div>
                                        {/* Badge */}
                                        {index === 0 && (
                                            <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                MAIN
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add New Image */}
                        <div className="flex flex-col gap-3">
                            <input
                                type="url"
                                value={newImageUrl}
                                onChange={e => setNewImageUrl(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="Paste Cloudinary URL..."
                                onKeyDown={e => e.key === 'Enter' && addImage()}
                            />
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newImageAlt.en}
                                    onChange={e => setNewImageAlt(prev => ({ ...prev, en: e.target.value }))}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Alt (English)"
                                    onKeyDown={e => e.key === 'Enter' && addImage()}
                                />
                                <input
                                    type="text"
                                    value={newImageAlt.he}
                                    onChange={e => setNewImageAlt(prev => ({ ...prev, he: e.target.value }))}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Alt (Hebrew)"
                                    dir="rtl"
                                    onKeyDown={e => e.key === 'Enter' && addImage()}
                                />
                                <input
                                    type="text"
                                    value={newImageAlt.ar}
                                    onChange={e => setNewImageAlt(prev => ({ ...prev, ar: e.target.value }))}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Alt (Arabic)"
                                    dir="rtl"
                                    onKeyDown={e => e.key === 'Enter' && addImage()}
                                />
                                <button
                                    onClick={addImage}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>
                        </div>
                        {form.images.length === 0 && (
                            <p className="text-sm text-slate-400 mt-3">No images yet. Add at least one Cloudinary URL above.</p>
                        )}
                    </div>


                    {/* ═══════════ SUBMIT ═══════════ */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            {isPending ? 'Saving...' : mode === 'create' ? 'Create Place' : 'Save Changes'}
                        </button>

                        <Link
                            href={`/${lang}/area-51-sec`}
                            className="text-slate-500 hover:text-slate-700 text-sm font-medium"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
