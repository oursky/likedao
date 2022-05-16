import React, { useEffect, useState } from "react";

export const useLocalStorage = <T>(
  key: string
): [T | null, React.Dispatch<React.SetStateAction<T | null>>] => {
  const [cachedValue, setCachedValue] = useState<T | null>(
    JSON.parse(window.localStorage.getItem(key) ?? "null")
  );

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(cachedValue));
  }, [cachedValue, key]);

  return [cachedValue, setCachedValue];
};
