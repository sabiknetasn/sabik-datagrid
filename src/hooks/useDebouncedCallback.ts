import { useEffect, useRef, useState } from 'react';
import { DATAGRID_CONSTANTS } from '../constants';

/** Debounced local value for controlled inputs that write to expensive table state. */
export function useDebouncedCallback<T>(
  value: T,
  onCommit: (value: T) => void,
  delay = DATAGRID_CONSTANTS.DEBOUNCE_TIME
): [T, (next: T) => void] {
  const [local, setLocal] = useState(value);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!Object.is(local, value)) {
        onCommitRef.current(local);
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [local, delay, value]);

  return [local, setLocal];
}
