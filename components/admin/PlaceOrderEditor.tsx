"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { getPlaceOrderAction, savePlaceOrderAction } from "@/app/actions/place-order";
import { movePlaceOrder, type PlaceOrderItem } from "@/lib/place-order";
import type { Dictionary, Locale } from "@/lib/get-dictionary";

type Props = {
    initialPlaces: PlaceOrderItem[];
    initialRevision: string;
    lang: Locale;
    dictionary: Dictionary["placeOrder"];
};

type HistoryGuardBrowser = Pick<Window, "history" | "addEventListener" | "removeEventListener">;

// Safari/older browsers do not expose cancelable Navigation API traversals.
// Capture before Next's popstate listener so a canceled Back cannot unmount the
// editor. No sentinel entries or global History API patches are necessary.
// Legacy History API cannot identify pre-existing Forward or multi-entry jumps;
// restoration here covers the normal one-entry Back action.
export function installLegacyPlaceOrderHistoryGuard(browser: HistoryGuardBrowser, confirmLeave: () => boolean) {
    let restoring = false;
    let disposed = false;
    const onPopState = (event: PopStateEvent) => {
        if (restoring) {
            event.stopImmediatePropagation();
            restoring = false;
            if (disposed) browser.removeEventListener("popstate", onPopState, true);
            return;
        }
        if (confirmLeave()) return;
        event.stopImmediatePropagation();
        restoring = true;
        browser.history.forward();
    };
    browser.addEventListener("popstate", onPopState, true);
    return () => {
        disposed = true;
        // A save may finish while the asynchronous restoration is in flight.
        // Suppress that one pending event before removing the guard.
        if (!restoring) browser.removeEventListener("popstate", onPopState, true);
    };
}

export function crossedPlaceOrderMidpoint(from: number, to: number, pointerY: number, midpoint: number, movement: number) {
    return (to > from && movement > 0 && pointerY >= midpoint) || (to < from && movement < 0 && pointerY <= midpoint);
}

export default function PlaceOrderEditor({ initialPlaces, initialRevision, lang, dictionary: t }: Props) {
    const [places, setPlaces] = useState(initialPlaces);
    const [ids, setIds] = useState(() => initialPlaces.map(place => place.id));
    const [savedIds, setSavedIds] = useState(ids);
    const [revision, setRevision] = useState(initialRevision);
    const [search, setSearch] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [announcement, setAnnouncement] = useState("");
    const [dragged, setDragged] = useState<string | null>(null);
    const busy = useRef(false);
    const drag = useRef<{ id: string; x: number; y: number; documentY: number; frame: number; original: string[] } | null>(null);
    const list = useRef<HTMLOListElement>(null);
    const idsRef = useRef(ids);
    const dirty = ids.some((id, index) => savedIds[index] !== id);
    const byId = useMemo(() => new Map(places.map(place => [place.id, place])), [places]);
    const positions = useMemo(() => new Map(ids.map((id, index) => [id, index])), [ids]);
    const filtered = ids.filter(id => Object.values(byId.get(id)?.title ?? {}).some(title => title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())));
    const titleFor = (id: string) => byId.get(id)?.title[lang] || byId.get(id)?.title.en || id;
    const errorMessage = error === "ORDER_CONFLICT" ? t.conflict : error === "RATE_LIMITED" ? t.rateLimited : error === "UNAUTHORIZED" || error === "FORBIDDEN" ? t.unauthorized : error === "VALIDATION_FAILED" ? t.invalid : t.failed;

    useEffect(() => {
        if (!dirty) return;
        const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
        const click = (event: MouseEvent) => {
            const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
            if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || anchor.href === location.href) return;
            if (!window.confirm(t.unsavedWarning)) { event.preventDefault(); event.stopImmediatePropagation(); }
        };
        // The Navigation API can cancel same-document history navigation before React unmounts.
        const navigation = (window as Window & { navigation?: EventTarget }).navigation;
        const navigate = (event: Event) => {
            const navigationEvent = event as Event & { navigationType?: string };
            if (navigationEvent.navigationType === "traverse" && event.cancelable && !window.confirm(t.unsavedWarning)) event.preventDefault();
        };
        window.addEventListener("beforeunload", beforeUnload);
        document.addEventListener("click", click, true);
        navigation?.addEventListener("navigate", navigate);
        const removeHistoryGuard = navigation ? undefined : installLegacyPlaceOrderHistoryGuard(window, () => window.confirm(t.unsavedWarning));
        return () => {
            window.removeEventListener("beforeunload", beforeUnload);
            document.removeEventListener("click", click, true);
            navigation?.removeEventListener("navigate", navigate);
            removeHistoryGuard?.();
        };
    }, [dirty, t.unsavedWarning]);

    useEffect(() => () => { if (drag.current) cancelAnimationFrame(drag.current.frame); }, []);

    function move(id: string, target: number) {
        const current = idsRef.current;
        const next = movePlaceOrder(current, current.indexOf(id), target);
        idsRef.current = next;
        setIds(next);
        setSuccess(false);
        setAnnouncement(t.moved.replace("{title}", titleFor(id)).replace("{position}", String(next.indexOf(id) + 1)));
    }

    function startDrag(event: PointerEvent<HTMLButtonElement>, id: string) {
        if (busy.current || event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { id, x: event.clientX, y: event.clientY, documentY: event.clientY + window.scrollY, frame: 0, original: [...idsRef.current] };
        setDragged(id);
        const tick = () => {
            const active = drag.current;
            if (!active) return;
            const margin = 80;
            const speed = active.y < margin ? -12 : active.y > window.innerHeight - margin ? 12 : 0;
            if (speed) window.scrollBy({ top: speed, behavior: "instant" });
            const documentY = active.y + window.scrollY;
            const movement = documentY - active.documentY;
            active.documentY = documentY;
            const row = document.elementFromPoint(active.x, active.y)?.closest<HTMLElement>("[data-place-id]");
            const targetId = row?.dataset.placeId;
            if (row && targetId && list.current?.contains(row) && targetId !== active.id) {
                const bounds = row.getBoundingClientRect();
                const from = idsRef.current.indexOf(active.id);
                const to = idsRef.current.indexOf(targetId);
                if (crossedPlaceOrderMidpoint(from, to, active.y, bounds.top + bounds.height / 2, movement)) move(active.id, to);
            }
            active.frame = requestAnimationFrame(tick);
        };
        drag.current.frame = requestAnimationFrame(tick);
    }

    function endDrag(cancel = false) {
        const active = drag.current;
        if (!active) return;
        cancelAnimationFrame(active.frame);
        if (cancel) { idsRef.current = active.original; setIds(active.original); }
        drag.current = null;
        setDragged(null);
    }

    async function save() {
        if (busy.current || !dirty) return;
        busy.current = true; setPending(true); setError(""); setSuccess(false);
        try {
            const result = await savePlaceOrderAction({ ids, revision });
            if ("errorCode" in result) { setError(result.errorCode); return; }
            setSavedIds([...ids]); setRevision(result.revision); setSuccess(true);
        } catch { setError("UNKNOWN_ERROR"); }
        finally { busy.current = false; setPending(false); }
    }

    async function reload() {
        if (busy.current || (dirty && !window.confirm(t.reloadWarning))) return;
        busy.current = true; setPending(true); setSuccess(false);
        try {
            const result = await getPlaceOrderAction();
            if ("errorCode" in result) { setError(result.errorCode); return; }
            const next = result.places.map(place => place.id);
            setPlaces(result.places); setIds(next); idsRef.current = next; setSavedIds(next); setRevision(result.revision); setError("");
        } catch { setError("UNKNOWN_ERROR"); }
        finally { busy.current = false; setPending(false); }
    }

    const controlClass = "min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";
    return (
        <div className="space-y-4" aria-busy={pending}>
            <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 space-y-3">
                <label htmlFor="place-order-search" className="block text-sm font-semibold">{t.search}</label>
                <input id="place-order-search" type="search" value={search} onChange={event => setSearch(event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 px-3 focus-visible:outline-blue-600" aria-describedby="place-order-help" />
                <p id="place-order-help" className="text-sm text-slate-600">{t.searchHelp}</p>
                <p className="text-sm text-slate-600">{t.positionHelp}</p>
                <p className="text-sm text-slate-600">{t.hiddenHelp}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={save} disabled={pending || !dirty || !!dragged} className="min-h-11 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{pending ? t.saving : t.save}</button>
                <span className="text-sm text-slate-600">{dirty ? t.unsaved : t.savedState}</span>
            </div>
            {success && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">{t.success}</p>}
            {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"><p>{errorMessage}</p>{error === "ORDER_CONFLICT" && <button type="button" disabled={pending} onClick={reload} className="mt-2 min-h-11 rounded-lg border border-red-300 px-4 font-semibold underline">{t.reload}</button>}</div>}
            <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
            {filtered.length === 0 && <p className="rounded-xl bg-white p-8 text-center text-slate-500">{places.length ? t.noResults : t.empty}</p>}
            <ol ref={list} aria-label={t.title} className="space-y-2" onKeyDown={event => { if (event.key === "Escape") endDrag(true); }}>
                {filtered.map(id => {
                    const position = positions.get(id)!;
                    const place = byId.get(id)!;
                    const title = titleFor(id);
                    return <li key={id} value={position + 1} data-place-id={id} className={`flex flex-wrap items-center gap-2 rounded-xl border p-3 sm:flex-nowrap md:gap-4 md:p-4 ${dragged === id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}>
                        <button type="button" disabled={pending} aria-label={t.drag.replace("{title}", title)} title={t.drag.replace("{title}", title)} className={`${controlClass} shrink-0 touch-none cursor-grab active:cursor-grabbing`} onPointerDown={event => startDrag(event, id)} onPointerMove={event => { if (drag.current) { drag.current.x = event.clientX; drag.current.y = event.clientY; } }} onPointerUp={() => endDrag()} onPointerCancel={() => endDrag(true)} onLostPointerCapture={() => endDrag()}><GripVertical size={20} aria-hidden="true" /></button>
                        <span className="min-w-6 text-sm font-semibold tabular-nums text-slate-500" aria-hidden="true">{position + 1}</span>
                        <div className="min-w-0 flex-1"><p className="break-words font-medium">{title}</p>{place.hidden && <span className="text-xs text-slate-500">{t.hidden}</span>}</div>
                        <form className="order-last flex basis-full items-center justify-end gap-2 sm:order-none sm:basis-auto" onSubmit={event => {
                            event.preventDefault();
                            if (busy.current || drag.current) return;
                            const destination = Number(new FormData(event.currentTarget).get("position"));
                            if (Number.isInteger(destination) && destination >= 1 && destination <= ids.length) move(id, destination - 1);
                        }}>
                            <label htmlFor={`position-${id}`} className="text-sm text-slate-600">{t.position}</label>
                            <input key={position} id={`position-${id}`} name="position" type="number" min={1} max={ids.length} step={1} required defaultValue={position + 1} disabled={pending || !!dragged} aria-label={t.positionFor.replace("{title}", title)} onFocus={event => event.currentTarget.select()} className="min-h-11 w-20 rounded-lg border border-slate-300 px-2 text-center tabular-nums focus-visible:outline-blue-600 disabled:opacity-50" />
                            <button type="submit" disabled={pending || !!dragged} aria-label={t.applyPosition.replace("{title}", title)} className={`${controlClass} px-3 text-sm font-medium`}>{t.move}</button>
                        </form>
                        <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                            <button type="button" disabled={pending || !!dragged || position === 0} onClick={() => move(id, position - 1)} aria-label={t.moveUp.replace("{title}", title)} title={t.moveUp.replace("{title}", title)} className={controlClass}><ArrowUp size={18} aria-hidden="true" /></button>
                            <button type="button" disabled={pending || !!dragged || position === ids.length - 1} onClick={() => move(id, position + 1)} aria-label={t.moveDown.replace("{title}", title)} title={t.moveDown.replace("{title}", title)} className={controlClass}><ArrowDown size={18} aria-hidden="true" /></button>
                        </div>
                    </li>;
                })}
            </ol>
        </div>
    );
}
