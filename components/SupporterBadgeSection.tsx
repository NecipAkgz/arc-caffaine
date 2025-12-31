"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  CREATOR_SUPPORTER_BADGE_ABI,
  CREATOR_SUPPORTER_BADGE_ADDRESS,
} from "@/lib/badge-abi";
import { Loader2, Award, Check, ExternalLink } from "lucide-react";
import { decodeEventLog } from "viem";

interface SupporterBadgeSectionProps {
  creatorAddress: `0x${string}`;
  creatorUsername: string;
  /** Whether the connected user has donated to this creator */
  hasDonated: boolean;
}

/**
 * SupporterBadgeSection Component
 *
 * Displays claim button and success modal with real on-chain NFT.
 * Only shows if user has donated to the creator.
 */
export function SupporterBadgeSection({
  creatorAddress,
  creatorUsername,
  hasDonated,
}: SupporterBadgeSectionProps) {
  const { address } = useAccount();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null);
  const [nftImageUri, setNftImageUri] = useState<string | null>(null);

  // Check if user has claimed for this creator
  const { data: hasClaimed, refetch: refetchHasClaimed } = useReadContract({
    address: CREATOR_SUPPORTER_BADGE_ADDRESS,
    abi: CREATOR_SUPPORTER_BADGE_ABI,
    functionName: "hasClaimed",
    args: address && creatorAddress ? [address, creatorAddress] : undefined,
    query: {
      enabled: !!address && !!creatorAddress,
    },
  });

  // Get badge tokenId for this supporter-creator pair
  const { data: badgeTokenId } = useReadContract({
    address: CREATOR_SUPPORTER_BADGE_ADDRESS,
    abi: CREATOR_SUPPORTER_BADGE_ABI,
    functionName: "badgeTokenId",
    args: address && creatorAddress ? [address, creatorAddress] : undefined,
    query: {
      enabled: !!address && !!creatorAddress && hasClaimed === true,
    },
  });

  // Fetch tokenURI for already claimed badges
  const { data: existingTokenUri } = useReadContract({
    address: CREATOR_SUPPORTER_BADGE_ADDRESS,
    abi: CREATOR_SUPPORTER_BADGE_ABI,
    functionName: "tokenURI",
    args: badgeTokenId ? [badgeTokenId] : undefined,
    query: {
      enabled: !!badgeTokenId && badgeTokenId > BigInt(0),
    },
  });

  // Claim function
  const {
    writeContract,
    data: claimHash,
    isPending: isClaimPending,
    reset: resetClaim,
  } = useWriteContract();

  // Wait for transaction
  const {
    isLoading: isConfirming,
    isSuccess,
    data: txReceipt,
  } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  // Fetch tokenURI for newly minted NFT
  const { data: newTokenUri } = useReadContract({
    address: CREATOR_SUPPORTER_BADGE_ADDRESS,
    abi: CREATOR_SUPPORTER_BADGE_ABI,
    functionName: "tokenURI",
    args: mintedTokenId ? [mintedTokenId] : undefined,
    query: {
      enabled: !!mintedTokenId,
    },
  });

  // Extract tokenId from transaction receipt logs
  useEffect(() => {
    if (isSuccess && txReceipt) {
      setIsConfirmed(true);
      refetchHasClaimed();

      // Parse logs to get tokenId from BadgeClaimed event
      for (const log of txReceipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: CREATOR_SUPPORTER_BADGE_ABI,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "BadgeClaimed") {
            const tokenId = (decoded.args as { tokenId: bigint }).tokenId;
            setMintedTokenId(tokenId);
            break;
          }
        } catch {
          // Not our event, skip
        }
      }
    }
  }, [isSuccess, txReceipt, refetchHasClaimed]);

  // Parse tokenURI and extract image
  useEffect(() => {
    const tokenUri = newTokenUri || existingTokenUri;
    if (tokenUri && typeof tokenUri === "string") {
      try {
        const base64Data = tokenUri.replace(
          "data:application/json;base64,",
          ""
        );
        const jsonString = atob(base64Data);
        const metadata = JSON.parse(jsonString);

        if (metadata.image) {
          setNftImageUri(metadata.image);
        }
      } catch (e) {
        console.error("Failed to parse tokenURI:", e);
      }
    }
  }, [newTokenUri, existingTokenUri]);

  const handleClaim = async () => {
    writeContract({
      address: CREATOR_SUPPORTER_BADGE_ADDRESS,
      abi: CREATOR_SUPPORTER_BADGE_ABI,
      functionName: "claim",
      args: [creatorUsername],
    });
  };

  const resetClaimState = () => {
    resetClaim();
    setIsConfirmed(false);
    setMintedTokenId(null);
    setNftImageUri(null);
  };

  // Already has badge (not during claim flow)
  if (hasClaimed && !isConfirmed) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-4xl">
            ☕
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              Supporter Badge
              <Check className="w-4 h-4 text-green-500" />
            </h3>
            <p className="text-sm text-muted-foreground">
              You have this creator&apos;s supporter badge!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Success Modal Overlay - rendered to body via portal */}
      {isConfirmed &&
        claimHash &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={resetClaimState}
            />

            {/* Modal Content */}
            <div className="relative bg-background border border-border rounded-2xl p-10 max-w-md w-full shadow-2xl">
              <div className="text-center space-y-6">
                {/* NFT Preview */}
                {nftImageUri ? (
                  <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden shadow-xl shadow-purple-500/40 border-2 border-purple-500/50">
                    <img
                      src={nftImageUri}
                      alt="Supporter Badge NFT"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 mx-auto rounded-2xl bg-linear-to-br from-purple-500 to-orange-500 flex items-center justify-center shadow-xl shadow-purple-500/40">
                    <Loader2 className="w-14 h-14 text-white animate-spin" />
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-foreground text-2xl flex items-center justify-center gap-2">
                    <Check className="w-7 h-7 text-green-500" />
                    Badge Claimed!
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    You&apos;re now a verified supporter of @{creatorUsername}
                  </p>
                </div>

                {/* TX Link */}
                <a
                  href={`https://testnet.arcscan.app/tx/${claimHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  View Transaction
                </a>

                <button
                  onClick={resetClaimState}
                  className="w-full bg-linear-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white py-4 rounded-xl font-bold text-lg transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Badge Section */}
      <div className="glass-card p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  hasDonated
                    ? "bg-linear-to-br from-purple-500/20 to-orange-500/20"
                    : "bg-secondary/50"
                }`}
              >
                <Award
                  className={`w-6 h-6 ${
                    hasDonated ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Supporter Badge</h3>
                <p className="text-sm text-muted-foreground">
                  {hasDonated
                    ? "Claim your on-chain badge!"
                    : "Support to unlock"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClaim}
              disabled={!hasDonated || isClaimPending || isConfirming}
              className="bg-linear-to-br from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {isClaimPending || isConfirming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  Claim
                </>
              )}
            </button>
          </div>

          {/* Info message when not donated */}
          {!hasDonated && (
            <p className="text-xs text-muted-foreground bg-secondary/30 px-3 py-2 rounded-lg">
              ☕ Buy a coffee to claim your exclusive supporter NFT badge on
              ARC!
            </p>
          )}
        </div>
      </div>
    </>
  );
}
