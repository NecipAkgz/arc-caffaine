import TelegramBot from "node-telegram-bot-api";
import { createClient } from "@supabase/supabase-js";
import { createPublicClient, http } from "viem";
import { arcTestnet } from "./chain";
import { CONTRACT_ADDRESS, ARC_CAFFEINE_ABI } from "./abi";
import dotenv from "dotenv";

dotenv.config();

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

if (!TELEGRAM_BOT_TOKEN || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing required environment variables!");
  process.exit(1);
}

// Initialize clients
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(),
});

console.log("🤖 ArcCaffeine Notification Bot started!");

/**
 * Handle /start command with deep linking
 * Format: /start 0x1234...
 */
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const walletAddress = match?.[1]?.toLowerCase();

  if (!walletAddress || !walletAddress.startsWith("0x")) {
    bot.sendMessage(
      chatId,
      "❌ Invalid wallet address. Please use the link from ArcCaffeine dashboard."
    );
    return;
  }

  try {
    // Save to database
    const { error } = await supabase.from("user_notifications").upsert({
      wallet_address: walletAddress,
      telegram_chat_id: chatId.toString(),
    });

    if (error) throw error;

    bot.sendMessage(
      chatId,
      `✅ Telegram linked successfully!\n\n` +
        `Wallet: \`${walletAddress.slice(0, 6)}...${walletAddress.slice(
          -4
        )}\`\n\n` +
        `You'll receive notifications when someone buys you a coffee! ☕`,
      { parse_mode: "Markdown" }
    );

    console.log(`✅ Linked ${walletAddress} to chat ${chatId}`);
  } catch (error) {
    console.error("Error saving to database:", error);
    bot.sendMessage(
      chatId,
      "❌ Failed to link Telegram. Please try again later."
    );
  }
});

/**
 * Handle regular /start without parameters
 */
bot.onText(/\/start$/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "👋 Welcome to ArcCaffeine Bot!\n\n" +
      "To receive donation notifications, please use the 'Connect Telegram' button from your ArcCaffeine dashboard.\n\n" +
      "Visit: https://arc-caffeine.vercel.app/dashboard"
  );
});

/**
 * Listen for NewMemo events in real-time
 */
async function startEventListener() {
  console.log("👂 Starting real-time event listener for NewMemo events...");

  const unwatch = publicClient.watchContractEvent({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ARC_CAFFEINE_ABI,
    eventName: "NewMemo",
    onLogs: async (logs) => {
      console.log(`🔔 Received ${logs.length} event(s)`);

      for (const log of logs) {
        try {
          const { from, to, name, message, amount } = log.args as {
            from: string;
            to: string;
            name: string;
            message: string;
            amount: bigint;
          };

          console.log(
            `📬 New donation: ${from} -> ${to}, amount: ${amount.toString()}`
          );

          // Lookup recipient's Telegram chat ID
          const { data, error } = await supabase
            .from("user_notifications")
            .select("telegram_chat_id")
            .eq("wallet_address", to.toLowerCase())
            .single();

          if (error || !data) {
            console.log(`⚠️  No Telegram linked for ${to}`);
            continue;
          }

          // Format amount (18 decimals, display 2)
          const amountFormatted = (Number(amount) / 1e18).toFixed(2);

          // Send notification
          const notificationText =
            `🎉 *New Coffee!*\n\n` +
            `💰 Amount: *${amountFormatted} USDC*\n` +
            `👤 From: ${name || "Anonymous"}\n` +
            `💬 Message: _${message || "No message"}_\n\n` +
            `View on dashboard: https://arc-caffeine.vercel.app/dashboard`;

          // Retry mechanism for network issues
          let retries = 3;
          while (retries > 0) {
            try {
              await bot.sendMessage(data.telegram_chat_id, notificationText, {
                parse_mode: "Markdown",
              });
              console.log(
                `✅ Notification sent to chat ${data.telegram_chat_id}`
              );
              break;
            } catch (sendError) {
              retries--;
              if (retries === 0) {
                console.error(
                  `❌ Failed to send notification after 3 attempts:`,
                  sendError
                );
              } else {
                console.log(
                  `⚠️ Send failed, retrying... (${retries} attempts left)`
                );
                await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
              }
            }
          }
        } catch (error) {
          console.error("Error processing event:", error);
        }
      }
    },
  });

  console.log("✅ Event listener active - waiting for donations...");

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n👋 Shutting down gracefully...");
    unwatch();
    process.exit(0);
  });
}

// Start the event listener
startEventListener();
