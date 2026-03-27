import { IBusinessDay, IOpeningHoursDictionary } from "@/lib/types";

/**
 * Formats 1000 into "10:00" or 900 into "09:00"
 */
const formatTime = (time: number): string => {
    const hours = Math.floor(time / 100).toString().padStart(2, "0");
    const minutes = (time % 100).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

/**
 * 1. Logic to Group Days (e.g., Sun-Thu 10:00-20:00)
 */
export function formatOpeningHours(
    openingHours: IBusinessDay[],
    dict: IOpeningHoursDictionary
): string {
    if (!openingHours || !Array.isArray(openingHours) || openingHours.length === 0) {
        return dict.closed;
    }

    const groups: { [key: string]: number[] } = {};

    // Group days by identical time slots
    openingHours.forEach((h) => {
        if (h.isClosed) return;

        const timeKey = `${formatTime(h.open)} - ${formatTime(h.close)}`;

        if (!groups[timeKey]) {
            groups[timeKey] = [];
        }
        groups[timeKey].push(h.day);
    });

    // Convert groups into readable strings
    const resultStrings = Object.entries(groups).map(([timeRange, days]) => {
        // Ensure days are in order (0, 1, 2...)
        days.sort((a, b) => a - b);

        // Math Trick: Check if days are a continuous sequence (e.g., 0, 1, 2, 3, 4)
        const isRange =
            days.length > 2 &&
            days[days.length - 1] - days[0] === days.length - 1;

        let dayLabel: string;
        if (isRange) {
            // "Sun-Thu" using translated labels from the dictionary
            dayLabel = `${dict.days[days[0]]}-${dict.days[days[days.length - 1]]}`;
        } else {
            // "Sun, Tue, Thu"
            dayLabel = days.map((d) => dict.days[d]).join(", ");
        }

        return `${dayLabel} ${timeRange}`;
    });

    // Return formatted string or the "Closed" label if no days are open
    return resultStrings.length > 0
        ? resultStrings.join(", ")
        : dict.closed;
}

/**
 * 2. Logic for the Live Status Dot (Open/Closed/Closing Soon)
 */
export function getOpeningStatus(openingHours: IBusinessDay[]): { status: 'open' | 'closing-soon' | 'closed', color: string } {
    if (!openingHours || !Array.isArray(openingHours) || openingHours.length === 0) {
        return { status: "closed", color: "bg-red-500" };
    }

    const now = new Date();

    // Create a formatter locked to Israel Timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jerusalem",
        hourCycle: "h23",
        hour: "numeric",
        minute: "numeric",
        weekday: "long", // Sunday, Monday, etc.
    });

    const parts = formatter.formatToParts(now);

    // Helper to find specific parts of the date string
    const getPart = (type: string) => parts.find(p => p.type === type)?.value;

    const weekdayName = getPart("weekday");
    const hours = parseInt(getPart("hour") || "0", 10);
    const minutes = parseInt(getPart("minute") || "0", 10);

    // Map weekday names to 0-6 (Standard JS: 0 = Sunday)
    const daysMap: Record<string, number> = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3,
        'Thu': 4, 'Fri': 5, 'Sat': 6
    };

    const currentDay = daysMap[weekdayName || ""] ?? now.getDay();
    const currentTime = hours * 100 + minutes;

    // Find the settings for today in the provided openingHours array
    const todayHours = openingHours.find((h) => h.day === currentDay);


    // If today is marked as closed or not found
    if (!todayHours || todayHours.isClosed) {
        return { status: "closed", color: "bg-red-500" };
    }

    // "Open" logic: Check if current time is within bounds
    if (currentTime >= todayHours.open && currentTime < todayHours.close) {
        // "Closing Soon" logic: If current time is within 1 hour (100 units) of closing
        if (currentTime >= todayHours.close - 100) {
            return { status: "closing-soon", color: "bg-amber-500" };
        }
        return { status: "open", color: "bg-green-500" };
    }

    // Default to closed (e.g., before opening hours or after closing hours)
    return { status: "closed", color: "bg-red-500" };
}