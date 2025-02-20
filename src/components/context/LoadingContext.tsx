import React, { createContext, useContext, useState } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';

const LoadingContext = createContext({
  setLoading: (loading: boolean) => {},
  loading: false,
});

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {loading && <LoadingSpinner />}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);