"use client";

import { useArcCaffeine } from "@/hooks/useArcCaffeine";
import { useEffect, useState, useMemo, useCallback } from "react";
import { ARC_CAFFEINE_ABI, CONTRACT_ADDRESS } from "@/lib/abi";
import {
  Loader2,
  Coffee,
  MessageSquare,
  Heart,
  Zap,
  Wallet,
  Sparkles,
} from "lucide-react";
import { useParams } from "next/navigation";
import {
  createPublicClient,
  http,
  formatEther,
  zeroAddress,
  formatUnits,
} from "viem";
import { arcTestnet } from "@/lib/chain";
import { toast } from "sonner";
import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import BridgeModal from "@/components/BridgeModal";
import { ARC_TESTNET } from "@/lib/bridge-kit/chains";
import { cn } from "@/lib/utils";
import { FadeIn, FloatingParticles } from "@/components/animations";
import { Avatar } from "@/components/ui/Avatar";
import { SupporterBadgeSection } from "@/components/SupporterBadgeSection";

/**
 * Memo interface representing a donation message from the smart contract.
 */
interface Memo {
  from: `0x${string}`;
  timestamp: bigint;
  name: string;
  message: string;
  amount: bigint;
}

/** Minimum donation amount in USDC */
const MIN_DONATION_AMOUNT = 0.1;

/** Preset donation amounts */
const DONATION_PRESETS = ["1", "3", "5"] as const;

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
] as const;

/**
 * Public Profile Page Component
 *
 * Displays a user's profile, including their bio, received messages (memos),
 * and a donation form to send USDC on the Arc Testnet.
 */
export default function PublicProfile() {
  const params = useParams();
  const username = params.username as string;
  const { isConnected, address } = useAccount();
  const { buyCoffee, loading: actionLoading } = useArcCaffeine();

  const [recipientAddress, setRecipientAddress] = useState<
    `0x${string}` | null
  >(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("5");
  const [newMemoKey, setNewMemoKey] = useState(0);
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  // Memoized public client to avoid recreation on each render
  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: arcTestnet,
        transport: http(),
      }),
    [],
  );
  const [showBridgeModal, setShowBridgeModal] = useState(false);

  /**
   * Fetch the user's USDC balance on the Arc Testnet.
   * Updates automatically every 5 seconds.
   */
  // Fetch Balance
  const { data: arcUsdcBalance } = useReadContract({
    address: ARC_TESTNET.usdcAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET.id,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  const formattedBalance = arcUsdcBalance
    ? formatUnits(arcUsdcBalance as bigint, 6)
    : "0.00";

  /**
   * Effect to fetch the profile data (address, bio, memos) for the given username.
   * Uses a public client to read from the smart contract.
   */
  /**
   * Fetches memos for a given address and sorts them by timestamp (newest first).
   */
  const fetchMemos = useCallback(
    async (addr: `0x${string}`): Promise<Memo[]> => {
      const data = (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ARC_CAFFEINE_ABI,
        functionName: "getMemos",
        args: [addr],
      })) as Memo[];
      return [...data].sort(
        (a, b) => Number(b.timestamp) - Number(a.timestamp),
      );
    },
    [publicClient],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const addr = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ARC_CAFFEINE_ABI,
          functionName: "addresses",
          args: [username],
        });

        if (!isMounted) return;

        if (addr && addr !== zeroAddress) {
          setRecipientAddress(addr);

          const bioData = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ARC_CAFFEINE_ABI,
            functionName: "bios",
            args: [addr],
          });

          if (!isMounted) return;
          setBio(bioData || "");

          const sorted = await fetchMemos(addr);
          if (!isMounted) return;
          setMemos(sorted);
        } else {
          setRecipientAddress(null);
        }
      } catch (e) {
        console.error("Failed to load profile:", e);
        if (isMounted) {
          toast.error("Profile could not be uploaded. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [username, publicClient, fetchMemos]);

  /**
   * Handles the donation process (buying coffee).
   *
   * 1. Validates the recipient address.
   * 2. Calls the buyCoffee function from the hook.
   * 3. Refetches the memos list after a successful transaction.
   * 4. Displays toast notifications for status updates.
   */
  const handleSupport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!recipientAddress) return;

    // Input validation
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < MIN_DONATION_AMOUNT) {
      toast.error(`Minimum donation amount ${MIN_DONATION_AMOUNT} USDC`);
      return;
    }

    const promise = buyCoffee(username, name, message, amount)
      .then(async () => {
        // Refetch memos after successful transaction
        const sorted = await fetchMemos(recipientAddress);
        setNewMemoKey((prev) => prev + 1);
        setMemos(sorted);
        setName("");
        setMessage("");
        setAmount("5");
      })
      .catch((error) => {
        console.error("Transaction failed:", error);
        throw error;
      });

    toast.promise(promise, {
      loading: "Brewing coffee... ☕",
      success: "Coffee bought successfully! Thank you for your support! 🎉",
      error: "Transaction failed. Please try again.",
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Loading profile...
          </p>
        </div>
      </div>
    );

  if (!recipientAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
          <Coffee className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
        <p className="text-muted-foreground">
          The user @{username} does not exist or has not set up their profile
          yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-foreground selection:bg-primary/20 overflow-x-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none -z-10" />
      <FloatingParticles />

      <div className="relative max-w-6xl mx-auto p-4 md:p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Profile & Donation (Sticky on Desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
            {/* Profile Card with Badge */}
            <FadeIn delay={0.2} direction="down">
              <div className="relative pt-14">
                {/* Avatar - Overflowing top with glow ring */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 z-10">
                  <div className="w-24 h-24 shadow-xl rounded-full overflow-hidden bg-background avatar-glow-ring">
                    <Avatar
                      address={recipientAddress || undefined}
                      size="xl"
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Card Body with Animated Gradient Border */}
                <div className="gradient-border-animated">
                  <div className="glass-card-premium overflow-hidden relative group">
                    <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Content */}
                    <div className="relative pt-16 pb-6 px-8 text-center">
                      <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        @{username}
                      </h1>
                      {bio && (
                        <p className="text-muted-foreground mt-3 leading-relaxed">
                          {bio}
                        </p>
                      )}
                    </div>

                    {/* Badge Section - Full Width Bottom */}
                    {isConnected && recipientAddress && (
                      <div className="px-4 pb-4">
                        <SupporterBadgeSection
                          creatorAddress={recipientAddress}
                          creatorUsername={username}
                          hasDonated={memos.some(
                            (memo) =>
                              memo.from.toLowerCase() ===
                              address?.toLowerCase(),
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Donation Card with Premium Effects */}
            <FadeIn delay={0.4} direction="up">
              <div className="glass-card-premium p-8 neon-glow-primary-hover">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Support
                  </h2>
                  {isConnected && (
                    <div className="flex items-center gap-2 text-xs font-medium bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50 text-muted-foreground">
                      <Wallet className="w-3 h-3" />
                      <span>{Number(formattedBalance).toFixed(2)} USDC</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSupport} className="space-y-5">
                  {/* Presets */}
                  <div className="grid grid-cols-3 gap-3">
                    {DONATION_PRESETS.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className={cn(
                          "relative py-2 rounded-xl border transition-all duration-200 font-medium overflow-hidden group",
                          amount === val
                            ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                            : "bg-secondary/40 border-border/50 hover:bg-secondary/60 hover:border-border text-muted-foreground",
                        )}
                      >
                        <span className="relative z-10">{val} USDC</span>
                        {amount === val && (
                          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                      $
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-secondary/30 border border-border/50 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-lg font-medium placeholder:text-muted-foreground/50 text-foreground"
                      placeholder="Custom amount"
                      required
                      min="0.1"
                      step="0.1"
                    />
                  </div>

                  {/* Name & Message */}
                  <div className="space-y-5">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                      placeholder="Name or @twitter (optional)"
                    />
                    <div className="relative">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-3.5 pr-12 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all min-h-[110px] resize-none placeholder:text-muted-foreground/50 text-foreground"
                        placeholder="Say something nice..."
                      />
                      <button
                        type="button"
                        disabled={generatingMessage}
                        onClick={async () => {
                          setGeneratingMessage(true);
                          setMessageError(null);
                          try {
                            const res = await fetch("/api/generate-message", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                creatorName: username,
                                amount,
                              }),
                            });
                            const data = await res.json();
                            if (res.ok) {
                              setMessage(data.message);
                            } else {
                              setMessageError(
                                data.error || "Failed to generate",
                              );
                            }
                          } catch (e) {
                            console.error("Failed to generate message", e);
                            setMessageError("Failed to generate message");
                          } finally {
                            setGeneratingMessage(false);
                          }
                        }}
                        className="absolute bottom-3 right-3 p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-all disabled:opacity-50 cursor-pointer"
                        title="Generate AI message"
                      >
                        {generatingMessage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {messageError && (
                      <p className="text-xs text-red-500 mt-1">
                        {messageError}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    {isConnected ? (
                      <>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="w-full bg-linear-to-r from-primary to-orange-400 hover:from-primary/90 hover:to-orange-500/90 text-primary-foreground py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group cursor-pointer btn-primary-glow neon-glow-primary-hover"
                        >
                          {actionLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              Support {amount} USDC
                              <Heart className="w-4 h-4 group-hover:scale-110 transition-transform fill-current" />
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowBridgeModal(true)}
                          className="w-full bg-secondary/50 hover:bg-secondary/80 text-muted-foreground hover:text-foreground py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer border border-border/50"
                        >
                          <Zap className="w-4 h-4" />
                          Need USDC? Bridge Funds
                        </button>
                      </>
                    ) : (
                      <ConnectButton.Custom>
                        {({ openConnectModal, mounted }) => (
                          <button
                            type="button"
                            onClick={openConnectModal}
                            disabled={!mounted}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            Connect Wallet to Support
                          </button>
                        )}
                      </ConnectButton.Custom>
                    )}
                  </div>
                </form>
              </div>
            </FadeIn>
          </div>

          {/* RIGHT COLUMN: Feed */}
          <div className="lg:col-span-7 space-y-6 lg:-mt-12 lg:pt-14">
            <FadeIn delay={0.6} direction="left">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Recent Messages
                </h3>
                <span className="text-sm text-muted-foreground">
                  {memos.length} supporters
                </span>
              </div>
            </FadeIn>

            <div
              className={`space-y-4 lg:max-h-[calc(100vh-30rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 transition-colors`}
            >
              {memos.length === 0 ? (
                <FadeIn delay={0.8} direction="up">
                  <div className="glass-card p-12 text-center">
                    <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                      No messages yet.
                    </p>
                    <p className="text-muted-foreground/60 text-sm mt-1">
                      Be the first to support @{username}!
                    </p>
                  </div>
                </FadeIn>
              ) : (
                <div className="space-y-4">
                  {memos.map((memo, i) => (
                    <div
                      key={`${memo.timestamp}-${memo.from}`}
                      className={`glass-card p-6 card-lift group animate-fade-in-up ${i < 5 ? `stagger-${i + 1}` : ""}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar address={memo.from} size="md" />
                          <div>
                            <p className="font-bold text-foreground">
                              {memo.name?.trim() || "Anonymous"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                Number(memo.timestamp) * 1000,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20 transition-all neon-glow-success-hover">
                          +{formatEther(memo.amount)} USDC
                        </div>
                      </div>
                      <p className="text-foreground/90 leading-relaxed pl-[52px]">
                        {memo.message?.trim() || (
                          <span className="text-muted-foreground italic">
                            No message
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BridgeModal
        isOpen={showBridgeModal}
        onClose={() => setShowBridgeModal(false)}
        amount={amount}
      />
    </div>
  );
}
