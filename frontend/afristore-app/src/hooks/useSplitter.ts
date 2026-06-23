"use client";

import { useState, useCallback } from "react";
import {
  deployRoyaltySplitter,
  getSplitterRecipients,
  SplitterRecipient,
} from "@/lib/splitter";

export function useDeploySplitter(creatorPublicKey: string | null) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deploy = useCallback(
    async (recipients: SplitterRecipient[]): Promise<string | null> => {
      if (!creatorPublicKey) {
        setError("Wallet not connected");
        return null;
      }

      setIsDeploying(true);
      setError(null);

      try {
        const address = await deployRoyaltySplitter(
          creatorPublicKey,
          recipients,
        );
        return address;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Deployment failed";
        setError(message);
        return null;
      } finally {
        setIsDeploying(false);
      }
    },
    [creatorPublicKey],
  );

  return { deploy, isDeploying, error };
}

export function useSplitterRecipients(contractId: string | null) {
  const [recipients, setRecipients] = useState<SplitterRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!contractId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSplitterRecipients(contractId);
      setRecipients(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load recipients",
      );
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  return { recipients, isLoading, error, refresh };
}
