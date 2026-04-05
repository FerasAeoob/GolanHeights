// components/openStatus.tsx
import { getOpeningStatus, formatOpeningHours } from "@/utils/businessHours";
import { IBusinessDay, IOpeningHoursDictionary } from "@/lib/types";

interface Props {
    openingHours?: IBusinessDay[];
    openString?: string;
    dict: IOpeningHoursDictionary;
    textordot: string;
}

export default function OpeningStatus({ openingHours, openString, dict, textordot }: Props) {
    const hasLiveHours = openingHours && openingHours.length > 0;

    // 1. Calculate live status only if we have structured data
    const { status } = getOpeningStatus(openingHours || []);

    // 2. Determine what text to show
    const hoursText = hasLiveHours
        ? formatOpeningHours(openingHours, dict)
        : (openString || "—");

    // 3. Status label & styles
    const statusLabel =
        status === "open" ? dict.openNow :
            status === "closing-soon" ? dict.closingSoon :
                dict.closed;

    const statusStyles: Record<'open' | 'closing-soon' | 'closed', string> = {
        open: "text-emerald-700 bg-emerald-100 border-emerald-200",
        "closing-soon": "text-amber-700 bg-amber-100 border-amber-200",
        closed: "text-red-700 bg-red-100 border-red-200"
    };

    const currentStyle = statusStyles[status];

    return (
        <div className="flex flex-col gap-1 h-full   ">
            {hasLiveHours && textordot === "status" && (
                <div className="flex h-7  ">
                    <span className={`text-[12px] font-bold px-[8px] uppercase rounded-md h-full flex pt-[5.5px] ${currentStyle}`}>
                        {statusLabel}
                    </span>
                </div>
            )}
            {hasLiveHours && textordot === "text" && (
                <span className="text-black/70 text-sm leading-relaxed">
                    {hoursText}
                </span>
            )}
        </div>
    );
}