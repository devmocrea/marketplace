"use client";

import { useState, useEffect, useCallback } from "react";
import { getOwnedTokens, OwnedToken } from "@/lib/indexer";

export function useOwnedNFTs(publicKey: string | null) {
  const [tokens, setTokens] = useState<OwnedToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    if (!publicKey) {
      setTokens([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getOwnedTokens(publicKey);
      setTokens(result);
    } catch (err: unknown) {
      console.error("Failed to fetch owned tokens:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load owned NFTs",
      );
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return { tokens, isLoading, error, refresh: fetchTokens };
}
