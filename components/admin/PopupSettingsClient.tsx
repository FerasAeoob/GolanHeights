"use client";

import { useState, useTransition } from "react";
import { updatePopupSettingsAction } from "@/app/actions/settings";
import { CheckCircle, AlertCircle } from "lucide-react";

type PopupSettingsClientProps = {
  initialSettings: {
    specialPlacePopupEnabled: boolean;
    specialPlacePopupPlaceId: string | null;
  };
  places: any[];
  lang: string;
};

export default function PopupSettingsClient({
  initialSettings,
  places,
  lang,
}: PopupSettingsClientProps) {
  const [enabled, setEnabled] = useState(initialSettings.specialPlacePopupEnabled);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(
    initialSettings.specialPlacePopupPlaceId || ""
  );
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (enabled && !selectedPlaceId) {
      setStatus({ type: "error", text: "Please select a featured place if the popup is enabled." });
      return;
    }

    startTransition(async () => {
      const res = await updatePopupSettingsAction(enabled, selectedPlaceId || null);
      if (res?.success) {
        setStatus({ type: "success", text: "Settings saved successfully!" });
      } else {
        setStatus({ 
          type: "error", 
          text: res?.errorCode === "PLACE_NOT_FOUND" 
            ? "The selected place does not exist or has been deleted."
            : "Failed to save settings." 
        });
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-800 text-sm">Enable Popup overlay on Homepage</label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-5 w-5 accent-blue-600 rounded cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Special Place</label>
        <select
          value={selectedPlaceId}
          onChange={(e) => setSelectedPlaceId(e.target.value)}
          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-900"
        >
          <option value="">-- No Featured Place Selected --</option>
          {places.map((p) => {
            const title = p.title?.[lang] || p.title?.en || p.name || "Untitled place";
            const category = typeof p.category === "string" ? p.category : "";
            return (
              <option key={p._id.toString()} value={p._id.toString()}>
                {title} {category ? `(${category})` : ""}
              </option>
            );
          })}
        </select>
      </div>

      {status && (
        <div className={`p-4 rounded-lg flex items-center gap-2.5 text-xs font-bold border ${
          status.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {status.type === "success" ? <CheckCircle className="h-4.5 w-4.5 shrink-0" /> : <AlertCircle className="h-4.5 w-4.5 shrink-0" />}
          <span>{status.text}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
      >
        {isPending ? "Saving..." : "Save Configuration"}
      </button>
    </form>
  );
}
