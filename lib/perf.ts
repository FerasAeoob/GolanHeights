export const ENABLE_PERF =
    process.env.NODE_ENV !== "production" || process.env.PERF === "true";

export function perfStart(label: string) {
    if (ENABLE_PERF) {
        console.time(label);
    }
}

export function perfEnd(label: string) {
    if (ENABLE_PERF) {
        console.timeEnd(label);
    }
}

export function perfLog(message: string) {
    if (ENABLE_PERF) {
        console.log(message);
    }
}
