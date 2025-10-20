'use client'

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import type { Connector } from "@/lib/coding-agent/connectors";

interface ConnectorsContextType {
  connectors: Connector[]
  refreshConnectors: () => Promise<void>
  isLoading: boolean
}

const ConnectorsContext = createContext<ConnectorsContextType | undefined>(undefined);

export const useConnectors = () => {
  const context = useContext(ConnectorsContext);
  if (!context) {
    throw new Error("useConnectors must be used within ConnectorsProvider");
  }
  return context;
};

interface ConnectorsProviderProps {
  children: React.ReactNode
}

export function ConnectorsProvider({ children }: ConnectorsProviderProps) {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConnectors = useCallback(async () => {
    try {
      const response = await fetch("/api/builder/connectors", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setConnectors(Array.isArray(data.connectors) ? data.connectors : []);
      } else if (response.status === 401) {
        setConnectors([]);
      }
    } catch (error) {
      console.error("Error fetching connectors:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConnectors();
  }, [fetchConnectors]);

  const refreshConnectors = useCallback(async () => {
    await fetchConnectors();
  }, [fetchConnectors]);

  return (
    <ConnectorsContext.Provider
      value={{
        connectors,
        refreshConnectors,
        isLoading,
      }}
    >
      {children}
    </ConnectorsContext.Provider>
  );
}
