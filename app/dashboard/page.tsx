"use client";

import { useAccount } from "wagmi";
import { useArcCaffeine } from "@/hooks/useArcCaffeine";
import { useEffect, useState, useMemo } from "react";
import { formatEther, createPublicClient, http } from "viem";
import { ARC_CAFFEINE_ABI, CONTRACT_ADDRESS } from "@/lib/abi";
import { arcTestnet } from "@/lib/chain";
import {
  Loader2,
  Copy,
  ExternalLink,
  DollarSign,
  History,
  Coffee,
  User,
  Edit,
  Bell,
  QrCode,
  Check,
  Twitter,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import BioModal from "@/components/BioModal";
import QRCodeModal from "@/components/QRCodeModal";
import {
  FadeIn,
  Stagger,
  FloatingParticles,
  CountUp,
} from "@/components/animations";
import { Memo } from "@/lib/types";
import { logger } from "@/lib/logger";

/**
 * User Dashboard Component
 *
 * Displays the user's balance, stats, profile bio, and transaction history.
 * Allows withdrawing funds and updating the bio.
 */
export default function Dashboard() {
  const { address } = useAccount();

  // Always use Arc Testnet client regardless of connected chain
  const arcPublicClient = useMemo(
    () =>
      createPublicClient({
        chain: arcTestnet,
        transport: http(),
      }),
    []
  );

  const {
    username,
    withdraw,
    updateBio,
    loading: actionLoading,
    getBalance,
    isRegistered,
    checkingRegistration,
  } = useArcCaffeine();
  const router = useRouter();
  const [balance, setBalance] = useState<string>("0");
  const [memos, setMemos] = useState<Memo[]>([]);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!address) {
        setLoading(false);
        return;
      }
      try {
        const bal = await getBalance();
        if (!isMounted) return;
        setBalance(formatEther(bal));

        const data = await arcPublicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ARC_CAFFEINE_ABI,
          functionName: "getMemos",
          args: [address],
        });
        if (!isMounted) return;
        // Sort by timestamp desc
        const sorted = [...(data as Memo[])].sort(
          (a, b) => Number(b.timestamp) - Number(a.timestamp)
        );
        setMemos(sorted);
      } catch (e) {
        logger.error("Failed to fetch dashboard data", e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const checkTelegramConnection = async () => {
      if (!address) return;
      try {
        const response = await fetch(
          `/api/telegram/status?address=${address.toLowerCase()}`
        );
        const data = await response.json();
        setTelegramConnected(data.connected);
      } catch (error) {
        console.error("Failed to check Telegram connection:", error);
      }
    };

    fetchData();
    checkTelegramConnection();

    return () => {
      isMounted = false;
    };
  }, [address, arcPublicClient, getBalance]);

  // Fetch bio separately and only once or when address changes
  useEffect(() => {
    let isMounted = true;

    const fetchBio = async () => {
      if (!address) return;
      try {
        const bioData = await arcPublicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ARC_CAFFEINE_ABI,
          functionName: "bios",
          args: [address],
        });
        if (isMounted) {
          setBio(bioData || "");
        }
      } catch (e) {
        logger.error("Failed to fetch bio", e);
      }
    };
    fetchBio();

    return () => {
      isMounted = false;
    };
  }, [address, arcPublicClient]);

  /**
   * Copies the user's public profile link to the clipboard.
   */
  const handleCopy = () => {
    if (username) {
      const url = `${window.location.origin}/${username}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Updates the user's bio.
   *
   * @param newBio - The new bio text to save.
   */
  const handleSaveBio = async (newBio: string) => {
    // BioModal handles the toast notifications
    await updateBio(newBio);
    setBio(newBio);
  };

  /**
   * Withdraws all available funds to the user's wallet.
   * Refreshes the balance after a successful withdrawal.
   */
  const handleWithdraw = async () => {
    const promise = withdraw().then(async () => {
      // Refresh balance
      const bal = await getBalance();
      setBalance(formatEther(bal));
    });

    toast.promise(promise, {
      loading: "Withdrawing funds...",
      success: "Withdrawal successful! 💸",
      error: "Withdraw failed. Please try again.",
    });
  };

  useEffect(() => {
    if (!loading && !checkingRegistration && !isRegistered) {
      router.push("/");
    }
  }, [loading, checkingRegistration, isRegistered, router]);

  if (loading || checkingRegistration) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isRegistered) {
    return null;
  }

  return (
    <div className="w-full px-4 md:px-8 py-8 relative">
      <FloatingParticles />
      <div className="mx-auto space-y-8" style={{ maxWidth: "1024px" }}>
        <FadeIn delay={0.2}>
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, @{username}</p>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg border border-border">
              <span className="text-sm text-muted-foreground px-2">
                Your Page:
              </span>
              <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                {username ? `${window.location.origin}/${username}` : "..."}
              </code>
              <button
                onClick={handleCopy}
                className={`p-2 rounded transition cursor-pointer flex items-center gap-1 ${
                  copied
                    ? "bg-green-500/20 text-green-500"
                    : "hover:bg-background"
                }`}
                title="Copy Link"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-medium">Copied!</span>
                  </>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="p-2 hover:bg-background rounded transition cursor-pointer"
                title="Show QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  "Support my creative journey on Arc Caffeine! ☕✨\n\nSend USDC & Mint my Supporter NFT on @Arc Testnet 👇\n\n"
                )}&url=${encodeURIComponent(
                  username ? `${window.location.origin}/${username}` : ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-background rounded transition cursor-pointer text-blue-400 hover:text-blue-500"
                title="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <Link
                href={`/${username}`}
                target="_blank"
                className="p-2 hover:bg-background rounded transition"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
            {telegramConnected ? (
              <div className="flex items-center gap-2 bg-green-600/20 border border-green-600/30 text-green-600 px-4 py-2 rounded-lg font-medium">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Connected ✓</span>
              </div>
            ) : (
              <a
                href={`https://t.me/ArcCaffeineBot?start=${address?.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 cursor-pointer"
                title="Get notified on Telegram when you receive a coffee"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Connect Telegram</span>
              </a>
            )}
          </div>
        </FadeIn>

        <Stagger
          staggerDelay={0.15}
          initialDelay={0.6}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Balance Card */}
          <div className="bg-secondary/30 border border-border rounded-2xl p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5" /> Current Balance
              </h3>
              <CountUp
                end={parseFloat(balance)}
                decimals={2}
                duration={2.5}
                className="text-4xl font-bold mt-4 block"
                suffix=" USDC"
              />
            </div>
            <button
              onClick={handleWithdraw}
              disabled={actionLoading || parseFloat(balance) <= 0}
              className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {actionLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Withdraw Funds"
              )}
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-secondary/30 border border-border rounded-2xl p-6">
            <h3 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
              <Coffee className="w-5 h-5" /> Total Coffees
            </h3>
            <CountUp
              end={memos.length}
              decimals={0}
              duration={2}
              className="text-4xl font-bold mt-4 block"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Lifetime supporters
            </p>
          </div>

          {/* Profile Settings */}
          <div className="bg-secondary/30 border border-border rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-5 h-5" /> Profile Bio
              </h3>
              <button
                onClick={() => setIsBioModalOpen(true)}
                className="p-2 hover:bg-background rounded-lg transition text-muted-foreground hover:text-foreground"
                title="Edit Bio"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 bg-background/50 rounded-lg p-4 border border-border/50">
              {bio ? (
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                  {bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No bio set yet. Click edit to add one.
                </p>
              )}
            </div>
          </div>
        </Stagger>

        {/* History */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6" /> Recent Support
          </h2>
          <div
            className={`scroll-container ${
              memos.length > 3 ? "has-scroll" : ""
            }`}
          >
            <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
              {memos.length === 0 ? (
                <p className="text-muted-foreground">
                  No coffees received yet. Share your link!
                </p>
              ) : (
                memos.map((memo, i) => (
                  <div
                    key={i}
                    className="bg-secondary/20 border border-border rounded-xl p-4 flex gap-4 items-start"
                  >
                    <Avatar address={memo.from} size="md" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold">
                          {memo.name?.trim() || "Anonymous"}
                        </h4>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-green-500">
                            +{formatEther(memo.amount)} USDC
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(
                              Number(memo.timestamp) * 1000
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {memo.message?.trim() || "No message"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        From: {memo.from.slice(0, 6)}...{memo.from.slice(-4)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <BioModal
          isOpen={isBioModalOpen}
          onClose={() => setIsBioModalOpen(false)}
          initialBio={bio}
          onSave={handleSaveBio}
        />

        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          profileUrl={username ? `${window.location.origin}/${username}` : ""}
          username={username || ""}
        />
      </div>
    </div>
  );
}
