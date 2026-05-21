"use client";

import dynamic from "next/dynamic";

const PlacesMapDynamic = dynamic(() => import("@/components/places/PlacesMapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">
      Loading map...
    </div>
  ),
});

export default PlacesMapDynamic;
