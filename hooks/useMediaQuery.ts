import { useSyncExternalStore, useCallback } from "react";

/**
 * Custom hook to detect media query matches.
 * Uses useSyncExternalStore for concurrent rendering compatibility.
 * Handles hydration mismatch via getServerSnapshot.
 *
 * @param query The media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const matchMedia = window.matchMedia(query);
      const handleChange = () => callback();

      matchMedia.addEventListener("change", handleChange);
      return () => {
        matchMedia.removeEventListener("change", handleChange);
      };
    },
    [query]
  );

  const getSnapshot = () => {
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => {
    return false;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
