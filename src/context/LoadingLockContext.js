// src/context/LoadingLockContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const LoadingLockContext = createContext();

export function LoadingLockProvider({ children }) {
  const [locked, setLocked] = useState(false);

  const withLock = useCallback(
    async fn => {
      if (locked) return; // already processing, ignore
      setLocked(true);
      try {
        await fn();
      } finally {
        setLocked(false); // always unlock even on error
      }
    },
    [locked],
  );

  return (
    <LoadingLockContext.Provider value={{ locked, withLock }}>
      {children}
    </LoadingLockContext.Provider>
  );
}

export const useLoadingLock = () => useContext(LoadingLockContext);
