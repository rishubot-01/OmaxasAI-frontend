import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Safely read a value from localStorage.
 */
function readStoredValue(key, initialValue) {
  try {
    if (typeof window === "undefined") {
      return initialValue;
    }

    const storedValue = window.localStorage.getItem(key);

    if (storedValue === null) {
      return initialValue;
    }

    return JSON.parse(storedValue);
  } catch (error) {
    console.warn(
      `Could not read localStorage key "${key}".`,
      error,
    );

    return initialValue;
  }
}

/**
 * Safely write a value to localStorage.
 */
function writeStoredValue(key, value) {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    window.localStorage.setItem(
      key,
      JSON.stringify(value),
    );

    return true;
  } catch (error) {
    console.warn(
      `Could not save localStorage key "${key}".`,
      error,
    );

    return false;
  }
}

/**
 * Reusable localStorage hook.
 *
 * @param {string} key Storage key.
 * @param {*} initialValue Default value when nothing is saved.
 * @returns {[*, Function, Function]} value, setter, remover.
 */
export function useLocalStorage(key, initialValue) {
  if (typeof key !== "string" || !key.trim()) {
    throw new Error(
      "useLocalStorage requires a non-empty string key.",
    );
  }

  const [value, setValueState] = useState(() =>
    readStoredValue(key, initialValue),
  );

  // Keep the latest state available to functional updates.
  const valueRef = useRef(value);
  const keyRef = useRef(key);

  /**
   * Update React state and persist the new value.
   * Accepts either a value or an updater function.
   */
  const setValue = useCallback(
    (nextValue) => {
      const currentValue =
        keyRef.current === key
          ? valueRef.current
          : readStoredValue(key, initialValue);

      const resolvedValue =
        typeof nextValue === "function"
          ? nextValue(currentValue)
          : nextValue;

      valueRef.current = resolvedValue;
      keyRef.current = key;

      setValueState(resolvedValue);
      writeStoredValue(key, resolvedValue);
    },
    [key, initialValue],
  );

  /**
   * Remove the stored value and reset to the initial value.
   */
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(
        `Could not remove localStorage key "${key}".`,
        error,
      );
    }

    valueRef.current = initialValue;
    keyRef.current = key;
    setValueState(initialValue);
  }, [key, initialValue]);

  // Reload the correct stored value if the key changes.
  useEffect(() => {
    const storedValue = readStoredValue(key, initialValue);

    keyRef.current = key;
    valueRef.current = storedValue;

    setValueState(storedValue);
  }, [key]); // Initial value is the default for this storage key.

  // Synchronize changes made in other browser tabs.
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function handleStorage(event) {
      if (
        event.key !== key &&
        event.key !== null
      ) {
        return;
      }

      const nextValue =
        event.key === null || event.newValue === null
          ? initialValue
          : (() => {
              try {
                return JSON.parse(event.newValue);
              } catch {
                return initialValue;
              }
            })();

      valueRef.current = nextValue;
      keyRef.current = key;

      setValueState(nextValue);
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [key, initialValue]);

  return [value, setValue, removeValue];
}

export default useLocalStorage;