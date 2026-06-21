"use client";

import { useWalletContext } from "@/context/WalletContext";
import { useOwnedNFTs } from "@/hooks/useOwnedNFTs";
import { Loader2, RefreshCw, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { OwnedToken } from "@/lib/indexer";

interface OwnedNFTGalleryProps {
  onSelect: (token: OwnedToken) => void;
}

export function OwnedNFTGallery({ onSelect }: OwnedNFTGalleryProps) {
  const { publicKey } = useWalletContext();
  const { tokens, isLoading, error, refresh } = useOwnedNFTs(publicKey);

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-white/60 font-inter text-lg">
          Connect your wallet to view your NFTs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-white">
          Select an NFT to List
        </h2>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
          <p>{error}</p>
        </div>
      )}

      {isLoading && tokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-brand-500 mb-4" />
          <p className="text-white/60 font-inter">Fetching your NFTs...</p>
        </div>
      ) : tokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <ImageIcon size={32} className="text-white/40" />
          </div>
          <h3 className="text-xl font-display font-bold text-white mb-2">
            No NFTs Found
          </h3>
          <p className="text-white/50 max-w-sm">
            It looks like you don&apos;t own any NFTs on this network yet, or
            the indexer hasn&apos;t synced them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tokens.map((token) => (
            <div
              key={`${token.collectionAddress}-${token.tokenId}`}
              className="group relative bg-midnight-900 rounded-3xl border border-white/10 overflow-hidden shadow-xl transition-all duration-300 hover:shadow-brand-500/20 hover:border-brand-500/40 hover:-translate-y-1"
            >
              <div className="aspect-square bg-midnight-950 relative overflow-hidden">
                {token.image ? (
                  <Image
                    src={token.image}
                    alt={token.name || `Token ${token.tokenId}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon size={48} className="text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-950/90 via-midnight-950/20 to-transparent opacity-60" />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-midnight-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <button
                    onClick={() => onSelect(token)}
                    className="translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-brand-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-400"
                  >
                    List for Sale
                  </button>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-display font-bold text-white truncate mb-1">
                  {token.name || `Token #${token.tokenId}`}
                </h3>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span
                    className="text-white/40 truncate w-32"
                    title={token.collectionAddress}
                  >
                    {token.collectionAddress.slice(0, 8)}...
                    {token.collectionAddress.slice(-6)}
                  </span>
                  <span className="text-brand-400 font-bold bg-brand-500/10 px-2 py-1 rounded-lg">
                    ID: {token.tokenId}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
