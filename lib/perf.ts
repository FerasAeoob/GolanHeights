export const ENABLE_PERF =
    process.env.LOAD_TEST_DEBUG === "true" || process.env.PERF === "true" || process.env.NODE_ENV !== "production";

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
