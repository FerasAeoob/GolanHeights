'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { CategorySlug } from '@/lib/categories';
import type { Dictionary, Locale } from '@/lib/get-dictionary';
import {
    MAX_PLACE_TAGS,
    MAX_PUBLIC_PLACE_TAGS,
    PLACE_TAG_GROUPS,
    addPlaceTag,
    getPlaceTagOptions,
    movePlaceTag,
    removePlaceTag,
    type PlaceTagGroupKey,
    type PlaceTagKey,
} from '@/lib/place-tags';

export type PlaceTagsDictionary = Dictionary['placeTags'];

interface PlaceTagSelectorProps {
    selected: PlaceTagKey[];
    category: CategorySlug;
    locale: Locale;
    dictionary: PlaceTagsDictionary;
    onChange: (next: PlaceTagKey[]) => void;
}

type FocusAction = 'move-earlier' | 'move-later' | 'remove' | 'option';

interface PendingFocus {
    action: FocusAction;
    key: PlaceTagKey;
}

function formatTemplate(
    template: string,
    replacements: Record<string, string | number>,
) {
    return Object.entries(replacements).reduce((message, [key, value]) => {
        return message
            .replaceAll(`{{${key}}}`, String(value))
            .replaceAll(`{${key}}`, String(value));
    }, template);
}

export default function PlaceTagSelector({
    selected,
    category,
    locale,
    dictionary,
    onChange,
}: PlaceTagSelectorProps) {
    const [announcement, setAnnouncement] = useState('');
    const [focusTick, setFocusTick] = useState(0);
    const pendingFocusRef = useRef<PendingFocus | null>(null);
    const browseDetailsRef = useRef<HTMLDetailsElement | null>(null);
    const browseSummaryRef = useRef<HTMLElement | null>(null);
    const sectionRef = useRef<HTMLElement | null>(null);
    const options = useMemo(() => getPlaceTagOptions(selected, category), [category, selected]);
    const atLimit = selected.length >= MAX_PLACE_TAGS;
    const selectedCount = formatTemplate(dictionary.selectedCount, {
        count: selected.length,
        max: MAX_PLACE_TAGS,
        locale,
    });

    const browseGroups = useMemo(() => {
        return (Object.keys(PLACE_TAG_GROUPS) as PlaceTagGroupKey[])
            .map((groupKey) => ({
                key: groupKey,
                label: dictionary.groups[groupKey],
                options: options.browseAll.filter((option) => option.group === groupKey),
            }))
            .filter((group) => group.options.length > 0);
    }, [dictionary.groups, options.browseAll]);

    const setFocusTarget = (target: PendingFocus) => {
        pendingFocusRef.current = target;
        setFocusTick((value) => value + 1);
    };

    const announceMove = (key: PlaceTagKey, next: PlaceTagKey[]) => {
        const position = next.indexOf(key) + 1;
        const status = position <= MAX_PUBLIC_PLACE_TAGS
            ? dictionary.shownPublicly
            : dictionary.savedMetadata;

        setAnnouncement(
            formatTemplate(dictionary.reorderAnnouncement, {
                label: dictionary.labels[key],
                position,
                status,
            }),
        );
    };

    useEffect(() => {
        const pendingFocus = pendingFocusRef.current;

        if (!pendingFocus || !sectionRef.current) {
            return;
        }

        if (pendingFocus.action === 'option' && browseDetailsRef.current && !browseDetailsRef.current.open) {
            browseDetailsRef.current.open = true;
        }

        const target = sectionRef.current.querySelector<HTMLButtonElement>(
            `[data-tag-key="${pendingFocus.key}"][data-tag-action="${pendingFocus.action}"]`,
        );

        if (target) {
            target.focus();
        } else if (pendingFocus.action === 'option') {
            browseSummaryRef.current?.focus();
        }

        pendingFocusRef.current = null;
    }, [selected, category, focusTick]);

    const renderOptionButton = (key: PlaceTagKey) => {
        const option = options.recommended.find((candidate) => candidate.key === key)
            ?? options.browseAll.find((candidate) => candidate.key === key)
            ?? options.selected.find((candidate) => candidate.key === key);

        if (!option) return null;

        const Icon = option.icon;

        return (
            <button
                key={key}
                type="button"
                data-tag-action="option"
                data-tag-key={key}
                aria-pressed={selected.includes(key)}
                disabled={atLimit}
                onClick={() => {
                    const next = addPlaceTag(selected, key);
                    setFocusTarget({ action: 'remove', key });
                    onChange(next);
                }}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors motion-reduce:transition-none hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-700" />
                <span>{dictionary.labels[key]}</span>
                <Plus aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
        );
    };

    return (
        <section ref={sectionRef} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">{dictionary.adminLabel}</h3>
                    <p className="text-sm font-medium text-slate-600">{selectedCount}</p>
                    <p className="text-sm text-slate-500">{dictionary.publicPriorityHelp}</p>
                </div>
                {atLimit ? (
                    <p className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                        {dictionary.maximumReached}
                    </p>
                ) : null}
            </div>

            <div className="sr-only" aria-live="polite">
                {announcement}
            </div>

            <ol className="mt-4 space-y-3">
                {options.selected.map((option, index) => {
                    const Icon = option.icon;
                    const position = index + 1;
                    const isPublic = position <= MAX_PUBLIC_PLACE_TAGS;

                    return (
                        <li
                            key={option.key}
                            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                    {position}
                                </span>
                                <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-blue-700" />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                        {dictionary.labels[option.key]}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500">
                                        {isPublic ? dictionary.shownPublicly : dictionary.savedMetadata}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                    type="button"
                                    data-tag-action="move-earlier"
                                    data-tag-key={option.key}
                                    onClick={() => {
                                        const next = movePlaceTag(selected, option.key, -1);
                                        const nextPosition = next.indexOf(option.key);
                                        const nextAction: FocusAction = nextPosition === 0 ? 'move-later' : 'move-earlier';

                                        setFocusTarget({ action: nextAction, key: option.key });
                                        onChange(next);
                                        announceMove(option.key, next);
                                    }}
                                    disabled={index === 0}
                                    aria-label={`${dictionary.moveEarlier}: ${dictionary.labels[option.key]}`}
                                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors motion-reduce:transition-none hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ArrowUp aria-hidden="true" className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    data-tag-action="move-later"
                                    data-tag-key={option.key}
                                    onClick={() => {
                                        const next = movePlaceTag(selected, option.key, 1);
                                        const nextPosition = next.indexOf(option.key);
                                        const nextAction: FocusAction = nextPosition === next.length - 1 ? 'move-earlier' : 'move-later';

                                        setFocusTarget({ action: nextAction, key: option.key });
                                        onChange(next);
                                        announceMove(option.key, next);
                                    }}
                                    disabled={index === selected.length - 1}
                                    aria-label={`${dictionary.moveLater}: ${dictionary.labels[option.key]}`}
                                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors motion-reduce:transition-none hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ArrowDown aria-hidden="true" className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    data-tag-action="remove"
                                    data-tag-key={option.key}
                                    onClick={() => {
                                        const next = removePlaceTag(selected, option.key);
                                        const fallbackKey = next[index] ?? next[index - 1] ?? option.key;
                                        const fallbackAction: FocusAction = next.length > 0 ? 'remove' : 'option';

                                        setFocusTarget({ action: fallbackAction, key: fallbackKey });
                                        onChange(next);
                                    }}
                                    aria-label={`${dictionary.remove}: ${dictionary.labels[option.key]}`}
                                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-red-200 text-red-600 transition-colors motion-reduce:transition-none hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                >
                                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ol>

            <div className="mt-5 space-y-4">
                {options.recommended.length > 0 ? (
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-700">{dictionary.recommended}</p>
                        <div className="flex flex-wrap gap-2">
                            {options.recommended.map((option) => renderOptionButton(option.key))}
                        </div>
                    </div>
                ) : null}

                <details ref={browseDetailsRef} className="rounded-xl border border-slate-200 bg-white p-3">
                    <summary
                        ref={browseSummaryRef}
                        className="flex min-h-[44px] cursor-pointer list-none items-center rounded-lg px-2 text-sm font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        {dictionary.browseAll}
                    </summary>
                    <div className="mt-4 space-y-4">
                        {browseGroups.map((group) => (
                            <div key={group.key} className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                                    {group.label}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {group.options.map((option) => renderOptionButton(option.key))}
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            </div>
        </section>
    );
}
