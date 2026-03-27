export interface IBusinessDay {
    day: number;      // 0-6
    open: number;     // e.g., 1000
    close: number;    // e.g., 2200
    isClosed: boolean;
}

export interface IOpeningHoursDictionary {
    days: string[];      // ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    closed: string;      // "Closed" / "סגור" / "مغلق"
    openNow: string;     // "Open Now"
    closingSoon: string; // "Closing Soon"
    separator: string;   // " | "
}