"use client";

import { useEffect, useMemo, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import Image from "next/image";
import { IPublicPlaceDTO } from "@/database/place.model";

// Fix default Leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type SupportedLang = "en" | "ar" | "he";
type TileMode = "detailed" | "clean";

interface PlacesMapProps {
    places: IPublicPlaceDTO[];
    lang: SupportedLang;
    dict: any;
}

interface MapBoundsProps {
    places: IPublicPlaceDTO[];
}

function MapBounds({ places }: MapBoundsProps) {
    const map = useMap();

    useEffect(() => {
        if (!places.length) return;

        if (places.length === 1) {
            const { lat, lng } = places[0].location;
            map.setView([lat, lng], 15, {
                animate: true,
            });
            return;
        }

        const bounds = L.latLngBounds(
            places.map((place) => [place.location.lat, place.location.lng])
        );

        if (bounds.isValid()) {
            map.fitBounds(bounds, {
                padding: [60, 60],
                maxZoom: 15,
                animate: true,
            });
        }
    }, [places, map]);

    return null;
}

function ResizeMap() {
    const map = useMap();

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            map.invalidateSize();
        }, 120);

        return () => window.clearTimeout(timeout);
    }, [map]);

    return null;
}

function isValidCoordinate(value: unknown) {
    return typeof value === "number" && Number.isFinite(value);
}

export default function PlacesMap({ places, lang, dict }: PlacesMapProps) {
    const [mounted, setMounted] = useState(false);
    const [activeTile, setActiveTile] = useState<TileMode>("detailed");

    const isRtl = lang === "ar" || lang === "he";

    useEffect(() => {
        setMounted(true);
    }, []);

    const validPlaces = useMemo(() => {
        return places.filter((place) => {
            const lat = place.location?.lat;
            const lng = place.location?.lng;

            return (
                place.location &&
                isValidCoordinate(lat) &&
                isValidCoordinate(lng) &&
                lat >= -90 &&
                lat <= 90 &&
                lng >= -180 &&
                lng <= 180
            );
        });
    }, [places]);

    if (!mounted) {
        return (
            <div className="w-full h-[360px] md:h-[520px] bg-slate-100 animate-pulse rounded-2xl shadow-xl border border-slate-200" />
        );
    }

    if (validPlaces.length === 0) {
        return (
            <div className="w-full h-[360px] md:h-[520px] flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
                <p className="text-slate-500 font-medium text-center px-6">
                    {dict.nomapdata || "No locations available to display on the map."}
                </p>
            </div>
        );
    }

    // Golan Heights / Majdal Shams area
    const defaultCenter: [number, number] = [33.266, 35.75];

    return (
        <div className="w-full h-[360px] md:h-[520px] rounded-2xl overflow-hidden shadow-xl shadow-emerald-900/10 border border-slate-200 relative z-10">
            {/* Map Type Toggle */}
            <div
                className={`absolute top-3 z-[500] flex bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200/80 gap-1 ${isRtl ? "left-3" : "right-3"
                    }`}
                dir={isRtl ? "rtl" : "ltr"}
                aria-label="Map style selector"
            >
                <button
                    type="button"
                    onClick={() => setActiveTile("detailed")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${activeTile === "detailed"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                        }`}
                >
                    {dict.mapDetailed || "Detailed"}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTile("clean")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${activeTile === "clean"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                        }`}
                >
                    {dict.mapClean || "Clean"}
                </button>
            </div>

            <MapContainer
                center={defaultCenter}
                zoom={11}
                maxZoom={19}
                minZoom={8}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                scrollWheelZoom={false}
                zoomControl={false}
            >
                <ZoomControl position={isRtl ? "topright" : "topleft"} />

                <TileLayer
                    key={activeTile}
                    attribution={
                        activeTile === "detailed"
                            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    }
                    url={
                        activeTile === "detailed"
                            ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                    }
                    maxZoom={19}
                />

                <ResizeMap />
                <MapBounds places={validPlaces} />

                {validPlaces.map((place) => {
                    const title = place.title?.[lang] || place.title?.en || "";
                    const locationName =
                        place.location?.name?.[lang] || place.location?.name?.en || "";
                    const slug = place.slug?.[lang] || place.slug?.en || "";
                    const image = place.images?.[0];

                    return (
                        <Marker
                            key={place._id.toString()}
                            position={[place.location.lat, place.location.lng]}
                        >
                            <Popup className="premium-popup">
                                <div
                                    className={`flex flex-col gap-2 w-[220px] ${isRtl ? "text-right" : "text-left"
                                        }`}
                                    dir={isRtl ? "rtl" : "ltr"}
                                >
                                    {image?.url && (
                                        <div className="relative w-full h-28 rounded-lg overflow-hidden bg-slate-100">
                                            <Image
                                                src={image.url}
                                                alt={image.alt?.[lang] || image.alt?.en || title}
                                                fill
                                                className="object-cover"
                                                sizes="220px"
                                            />
                                        </div>
                                    )}

                                    <div className="mt-1">
                                        <h3 className="font-bold text-sm text-slate-900 leading-tight">
                                            {title}
                                        </h3>

                                        {locationName && (
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                                {locationName}
                                            </p>
                                        )}

                                        {place.category && (
                                            <div
                                                className={`mt-2 flex ${isRtl ? "justify-end" : "justify-start"
                                                    }`}
                                            >
                                                <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-full">
                                                    {dict.categories?.[place.category] || place.category}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {slug && (
                                        <Link
                                            href={
                                                lang === "en"
                                                    ? `/places/${slug}`
                                                    : `/${lang}/places/${slug}`
                                            }
                                            className="mt-2 block w-full text-center bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                                        >
                                            {dict.viewdetails || "View Details"}
                                        </Link>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            <style jsx global>{`
        .premium-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 4px;
          box-shadow:
            0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }

        .premium-popup .leaflet-popup-content {
          margin: 8px;
          width: 220px !important;
        }

        .premium-popup .leaflet-popup-tip {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .premium-popup a.leaflet-popup-close-button {
          padding: 4px;
          color: #fff;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 999px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          top: 12px;
          ${isRtl ? "left: 12px; right: auto;" : "right: 12px;"}
        }

        .premium-popup a.leaflet-popup-close-button:hover {
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
        }

        .leaflet-control-zoom {
          border: 1px solid rgba(203, 213, 225, 0.9) !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12) !important;
        }

        .leaflet-control-zoom a {
          color: #0f172a !important;
          border-color: rgba(203, 213, 225, 0.9) !important;
        }

        .leaflet-control-attribution {
          font-size: 10px;
        }
      `}</style>
        </div>
    );
}