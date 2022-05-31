import { useEffect, useRef } from "react";

export function useWindowEvent(
  type: string,
  listener: EventListener,
  options?: boolean | AddEventListenerOptions
): void {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    function handler(event: Event) {
      listenerRef.current.call(window, event);
    }

    window.addEventListener(type, handler, options);
    return () => window.removeEventListener(type, handler, options);
  }, [type, options]);
}
