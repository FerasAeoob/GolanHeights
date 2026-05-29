import { IBusinessDay, IOpeningHoursDictionary } from "@/lib/types";

/**
 * Parses any time format into minutes from midnight (0 to 1439).
 * Returns null if the format is invalid or out of range.
 */
export function parseTimeToMinutes(timeInput: string | number | undefined | null): number | null {
    if (timeInput === undefined || timeInput === null) return null;
    
    if (typeof timeInput === 'number') {
        const hours = Math.floor(timeInput / 100);
        const minutes = timeInput % 100;
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return null;
        }
        return hours * 60 + minutes;
    }
    
    let str = timeInput.trim().toLowerCase();
    if (!str) return null;
    
    // Matches 6am, 6:00 AM, 12pm, etc.
    const ampmMatch = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
    if (ampmMatch) {
        const hoursStr = ampmMatch[1];
        const minsStr = ampmMatch[2];
        const ampm = ampmMatch[3];
        
        let hours = parseInt(hoursStr, 10);
        let minutes = minsStr ? parseInt(minsStr, 10) : 0;
        
        if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
            return null;
        }
        
        if (ampm === 'pm' && hours < 12) {
            hours += 12;
        } else if (ampm === 'am' && hours === 12) {
            hours = 0;
        }
        
        return hours * 60 + minutes;
    }
    
    // Matches "18:00", "03:00", etc.
    const hhmmMatch = str.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmmMatch) {
        const hours = parseInt(hhmmMatch[1], 10);
        const minutes = parseInt(hhmmMatch[2], 10);
        
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return null;
        }
        
        return hours * 60 + minutes;
    }
    
    // Matches numeric strings
    if (/^\d+$/.test(str)) {
        const parsedNum = parseInt(str, 10);
        if (str.length >= 3 && parsedNum >= 100) {
            const hours = Math.floor(parsedNum / 100);
            const minutes = parsedNum % 100;
            if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                return null;
            }
            return hours * 60 + minutes;
        } else {
            const hours = parsedNum;
            if (hours < 0 || hours > 23) {
                return null;
            }
            return hours * 60;
        }
    }
    
    return null;
}

/**
 * Formats time (string or military number) into "HH:MM"
 */
const formatTime = (time: number | string): string => {
    const totalMinutes = parseTimeToMinutes(time);
    if (totalMinutes === null) return "--:--";
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
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

        const timeKey = h.is24Hours
            ? (dict.twentyFourSeven || "24/7")
            : `${formatTime(h.open)} - ${formatTime(h.close)}`;

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
export function getOpeningStatus(
    openingHours: IBusinessDay[],
    now: Date = new Date()
): { status: 'open' | 'closing-soon' | 'closed', color: string } {
    if (!openingHours || !Array.isArray(openingHours) || openingHours.length === 0) {
        return { status: "closed", color: "bg-red-500" };
    }

    // Create a formatter locked to Israel Timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jerusalem",
        hourCycle: "h23",
        hour: "numeric",
        minute: "numeric",
        weekday: "short", // Sun, Mon, etc.
    });

    const parts = formatter.formatToParts(now);

    // Helper to find specific parts of the date string
    const getPart = (type: string) => parts.find(p => p.type === type)?.value;

    const weekdayName = getPart("weekday");
    const hours = parseInt(getPart("hour") || "0", 10);
    const minutes = parseInt(getPart("minute") || "0", 10);

    // Map weekday names to 0-6 (Standard JS: 0 = Sunday)
    const daysMap: Record<string, number> = {
        'sun': 0, 'sunday': 0,
        'mon': 1, 'monday': 1,
        'tue': 2, 'tuesday': 2,
        'wed': 3, 'wednesday': 3,
        'thu': 4, 'thursday': 4,
        'fri': 5, 'friday': 5,
        'sat': 6, 'saturday': 6
    };

    const currentDay = daysMap[(weekdayName || "").toLowerCase()] ?? now.getDay();
    const yesterdayDay = (currentDay - 1 + 7) % 7;

    const currentTimeMins = hours * 60 + minutes;

    // Find the settings for today and yesterday in the provided openingHours array
    const todayHours = openingHours.find((h) => h.day === currentDay);
    const yesterdayHours = openingHours.find((h) => h.day === yesterdayDay);

    let isOpen = false;
    let maxMinutesRemaining = 0;

    // 1. Check yesterday's overnight hours continuing into today morning
    if (yesterdayHours && !yesterdayHours.isClosed) {
        const yOpen = parseTimeToMinutes(yesterdayHours.open);
        const yClose = parseTimeToMinutes(yesterdayHours.close);

        if (yOpen !== null && yClose !== null) {
            const is24 = (yesterdayHours as any).is24Hours || (yesterdayHours as any).open24Hours;

            if (yClose === yOpen && is24) {
                isOpen = true;
                maxMinutesRemaining = Math.max(maxMinutesRemaining, 1440);
            } else if (yClose < yOpen) {
                // Overnight schedule: yesterdayOpen to midnight, midnight to yesterdayClose
                if (currentTimeMins < yClose) {
                    isOpen = true;
                    const remaining = yClose - currentTimeMins;
                    maxMinutesRemaining = Math.max(maxMinutesRemaining, remaining);
                }
            }
        }
    }

    // 2. Check today's schedule
    if (todayHours && !todayHours.isClosed) {
        const tOpen = parseTimeToMinutes(todayHours.open);
        const tClose = parseTimeToMinutes(todayHours.close);

        if (tOpen !== null && tClose !== null) {
            const is24 = (todayHours as any).is24Hours || (todayHours as any).open24Hours;

            if (tClose === tOpen && is24) {
                isOpen = true;
                maxMinutesRemaining = Math.max(maxMinutesRemaining, 1440);
            } else if (tClose > tOpen) {
                // Same-day schedule
                if (currentTimeMins >= tOpen && currentTimeMins < tClose) {
                    isOpen = true;
                    const remaining = tClose - currentTimeMins;
                    maxMinutesRemaining = Math.max(maxMinutesRemaining, remaining);
                }
            } else if (tClose < tOpen) {
                // Overnight schedule: starts today, ends tomorrow
                if (currentTimeMins >= tOpen) {
                    isOpen = true;
                    const remaining = (1440 - currentTimeMins) + tClose;
                    maxMinutesRemaining = Math.max(maxMinutesRemaining, remaining);
                }
            }
        }
    }

    if (isOpen) {
        // "Closing Soon" logic: If remaining time is within 1 hour (60 minutes)
        if (maxMinutesRemaining <= 60) {
            return { status: "closing-soon", color: "bg-amber-500" };
        }
        return { status: "open", color: "bg-green-500" };
    }

    // Default to closed
    return { status: "closed", color: "bg-red-500" };
}