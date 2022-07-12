import { useEffect, useRef, useLayoutEffect } from "react";

export function useInterval(callback: () => void, delay: number): void {
  const savedCallback = useRef<() => void>(callback);

  // Remember the latest callback.
  useLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}
