"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import Image from "next/image";
import { IPlaceSerializable } from "@/database/place.model";

// Fix default Leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to auto-fit bounds
function MapBounds({ places }: { places: IPlaceSerializable[] }) {
    const map = useMap();
    useEffect(() => {
        if (places.length > 0) {
            const bounds = L.latLngBounds(places.map(p => [p.location.lat, p.location.lng]));
            // Only fly to bounds if they are valid
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            }
        }
    }, [places, map]);
    return null;
}

// Component to force map resize after mount
function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
}

interface PlacesMapProps {
    places: IPlaceSerializable[];
    lang: 'en' | 'ar' | 'he';
    dict: any;
}

export default function PlacesMap({ places, lang, dict }: PlacesMapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // If not mounted yet, show a skeleton to avoid hydration mismatches
    if (!mounted) {
        return (
            <div className="w-full h-[360px] md:h-[520px] bg-slate-100 animate-pulse rounded-2xl shadow-xl border border-slate-200"></div>
        );
    }

    // Filter places to only those with valid latitude and longitude
    const validPlaces = places.filter(p => p.location && typeof p.location.lat === 'number' && typeof p.location.lng === 'number');

    if (validPlaces.length === 0) {
        return (
            <div className="w-full h-[360px] md:h-[520px] flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
                <p className="text-slate-500 font-medium">
                    {dict.nomapdata || "No locations available to display on the map."}
                </p>
            </div>
        );
    }

    // Default center near Golan Heights / Majdal Shams area
    const defaultCenter: [number, number] = [33.266, 35.75];

    // Check if RTL
    const isRtl = lang === 'ar' || lang === 'he';

    return (
        <div className="w-full h-[360px] md:h-[520px] rounded-2xl overflow-hidden shadow-xl shadow-emerald-900/10 border border-slate-200 relative z-10">
            <MapContainer
                center={defaultCenter}
                zoom={11}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                />
                <ResizeMap />
                <MapBounds places={validPlaces} />
                
                {validPlaces.map(place => {
                    const title = place.title?.[lang] || place.title?.en || "";
                    const locationName = place.location?.name?.[lang] || place.location?.name?.en || "";
                    const slug = place.slug?.[lang] || place.slug?.en || "";
                    
                    return (
                        <Marker key={place._id.toString()} position={[place.location.lat, place.location.lng]}>
                            <Popup className="premium-popup">
                                <div className={`flex flex-col gap-2 w-[220px] ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                                    {place.images && place.images.length > 0 && (
                                        <div className="relative w-full h-28 rounded-lg overflow-hidden">
                                            <Image 
                                                src={place.images[0].url} 
                                                alt={place.images[0].alt?.[lang] || place.images[0].alt?.en || title} 
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
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                            {locationName}
                                        </p>
                                        <div className={`mt-2 flex ${isRtl ? 'justify-end' : 'justify-start'}`}>
                                            <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-full">
                                                {dict.categories?.[place.category] || place.category}
                                            </span>
                                        </div>
                                    </div>
                                    <Link 
                                        href={`/${lang}/places/${slug}`}
                                        className="mt-2 block w-full text-center bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                                    >
                                        {dict.viewdetails || "View Details"}
                                    </Link>
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
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
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
                    background: rgba(0,0,0,0.4);
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    top: 12px;
                    right: 12px;
                    ${isRtl ? 'left: 12px; right: auto;' : ''}
                }
                .premium-popup a.leaflet-popup-close-button:hover {
                    background: rgba(0,0,0,0.6);
                    color: #fff;
                }
            `}</style>
        </div>
    );
}
