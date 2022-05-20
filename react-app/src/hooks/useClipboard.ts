import { useCallback } from "react";

export const useClipboard = (): ((text: string) => Promise<void>) => {
  return useCallback(async (text: string) => {
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(text);
    } else {
      // For older browsers
      document.execCommand("copy", true, text);
    }
  }, []);
};
