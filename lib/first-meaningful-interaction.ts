type Cleanup = () => void;

const INTERACTION_LISTENERS: ReadonlyArray<{
  type: keyof WindowEventMap;
  options?: AddEventListenerOptions;
}> = [
  {
    type: "scroll",
    options: { once: true, passive: true },
  },
  {
    type: "pointerdown",
    options: { once: true, passive: true },
  },
  {
    type: "keydown",
    options: { once: true },
  },
];

export function listenForFirstMeaningfulInteraction(
  target: EventTarget,
  onInteraction: () => void,
): Cleanup {
  let hasTriggered = false;

  const cleanup = () => {
    for (const { type, options } of INTERACTION_LISTENERS) {
      target.removeEventListener(type, handleInteraction, options);
    }
  };

  const handleInteraction = () => {
    if (hasTriggered) {
      return;
    }

    hasTriggered = true;
    cleanup();
    onInteraction();
  };

  for (const { type, options } of INTERACTION_LISTENERS) {
    target.addEventListener(type, handleInteraction, options);
  }

  return cleanup;
}
