export const NAVBAR_HIDE_START_Y = 80;
export const NAVBAR_MOVEMENT_THRESHOLD = 8;

export interface NavbarScrollState {
    isVisible: boolean;
    previousScrollY: number;
    accumulatedDelta: number;
}

interface NavbarScrollInput {
    scrollY: number;
    isEnabled: boolean;
    canScroll: boolean;
    mustStayVisible: boolean;
}

export function getNextNavbarScrollState(
    state: NavbarScrollState,
    input: NavbarScrollInput,
): NavbarScrollState {
    const scrollY = Math.max(0, input.scrollY);

    if (
        !input.isEnabled
        || !input.canScroll
        || input.mustStayVisible
        || scrollY <= NAVBAR_HIDE_START_Y
    ) {
        return {
            isVisible: true,
            previousScrollY: scrollY,
            accumulatedDelta: 0,
        };
    }

    const delta = scrollY - state.previousScrollY;
    let accumulatedDelta = state.accumulatedDelta;

    if (delta !== 0) {
        const directionChanged = accumulatedDelta !== 0
            && Math.sign(accumulatedDelta) !== Math.sign(delta);
        accumulatedDelta = directionChanged ? delta : accumulatedDelta + delta;
    }

    let isVisible = state.isVisible;
    if (Math.abs(accumulatedDelta) >= NAVBAR_MOVEMENT_THRESHOLD) {
        isVisible = accumulatedDelta < 0;
        accumulatedDelta = 0;
    }

    return {
        isVisible,
        previousScrollY: scrollY,
        accumulatedDelta,
    };
}
