type Cleanup = () => void;

type ScrollThresholdTarget = EventTarget & {
  scrollY: number;
  innerHeight: number;
  document: {
    documentElement: {
      scrollHeight: number;
    };
  };
};

const SCROLL_THRESHOLD = 0.2;

export function listenForFirstMeaningfulInteraction(
  target: ScrollThresholdTarget,
  onInteraction: () => void,
): Cleanup {
  let hasTriggered = false;

  const cleanup = () => {
    target.removeEventListener("scroll", handleScroll);
  };

  const handleScroll = () => {
    if (hasTriggered) {
      return;
    }

    const scrollableDistance =
      target.document.documentElement.scrollHeight - target.innerHeight;
    if (scrollableDistance <= 0) {
      return;
    }

    const scrollProgress = Math.max(0, target.scrollY) / scrollableDistance;
    if (scrollProgress < SCROLL_THRESHOLD) {
      return;
    }

    hasTriggered = true;
    cleanup();
    onInteraction();
  };

  target.addEventListener("scroll", handleScroll, { passive: true });

  return cleanup;
}
