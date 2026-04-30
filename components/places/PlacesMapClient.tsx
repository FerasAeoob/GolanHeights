"use client";

import dynamic from "next/dynamic";
import { IPlaceSerializable } from "@/database/place.model";

const PlacesMap = dynamic(() => import("@/components/places/PlacesMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] md:h-[520px] rounded-3xl border bg-slate-100 animate-pulse" />
  ),
});

interface PlacesMapClientProps {
  places: IPlaceSerializable[];
  lang: 'en' | 'ar' | 'he';
  dict: any;
}

export default function PlacesMapClient(props: PlacesMapClientProps) {
  return <PlacesMap {...props} />;
}
