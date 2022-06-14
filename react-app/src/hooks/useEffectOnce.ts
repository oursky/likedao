import React, { useEffect, useRef } from "react";

export function useEffectOnce(
  effect: React.EffectCallback,
  condition: () => boolean
): void {
  const didRunOnce = useRef(false);
  useEffect(() => {
    if (didRunOnce.current) {
      return undefined;
    }
    if (condition()) {
      didRunOnce.current = true;
      return effect();
    }
    return undefined;
  });
}
