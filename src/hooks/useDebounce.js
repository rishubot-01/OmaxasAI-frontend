import { useEffect, useState } from "react";

/**
 * Delays updating a value until the user stops changing it
 * for the specified duration.
 *
 * @param {*} value - The value to debounce.
 * @param {number} delay - Delay in milliseconds (default: 300).
 * @returns {*} The debounced value.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const safeDelay =
      Number.isFinite(delay) && delay >= 0
        ? delay
        : 300;

    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, safeDelay);

    // Cancel the previous timer when the value changes.
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;