# ArcCaffeine ☕️

**ArcCaffeine** is a decentralized "Buy Me a Coffee" platform built on the **Arc Blockchain Testnet**. It empowers creators to receive support in **USDC** directly from their fans, with a seamless user experience that includes profile customization, cross-chain bridge, and **real-time Telegram notifications**.

## 🌟 Features

- **User Profiles**: Create a unique profile with a custom username (`@username`) and bio.
- **Public Pages**: Share your personalized link (e.g., `app.com/necip`) to receive support.
- **USDC Donations**: Receive donations in USDC directly on the Arc Testnet.
- **Telegram Notifications** 🆕: Get instant alerts on Telegram when you receive a coffee donation.
- **Integrated Bridge**: Built-in **Circle BridgeKit** integration allows users to bridge USDC from Sepolia, Base Sepolia, and other testnets to Arc Testnet without leaving the app.
- **Dashboard**: Track your earnings, view recent messages, withdraw funds, and connect Telegram.
- **Responsive Design**: A modern, dark-themed UI built with Tailwind CSS that works great on all devices.

## 🛠 Tech Stack

### Frontend
- [Next.js 15](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Wagmi](https://wagmi.sh/) & [Viem](https://viem.sh/)
- [RainbowKit](https://www.rainbowkit.com/)
- [Circle BridgeKit](https://developers.circle.com/w3s/bridge-kit)

### Backend (Notification Server)
- [Node.js](https://nodejs.org/) + TypeScript
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Supabase](https://supabase.com/) (Database)
- [Viem](https://viem.sh/) (Blockchain event listener)

### Smart Contract
- Solidity (Deployed on Arc Testnet)

## 🔗 Smart Contract

The ArcCaffeine smart contract handles user registration, donations, and withdrawals.

- **Contract Address**: [`0xcC7F8BD425265EA2619B0876B76487B824D57c2d`](https://testnet.arcscan.app/address/0xcC7F8BD425265EA2619B0876B76487B824D57c2d)
- **Network**: Arc Testnet

## 🚀 Getting Started

### Frontend Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/NecipAkgz/arc-caffaine.git
   cd arc-caffaine
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment:**

   Create `.env.local`:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open the app:**

   Visit [http://localhost:3000](http://localhost:3000)

### Notification Server Setup (Optional)

For Telegram notifications, set up the notification server:

1. **Navigate to server directory:**

   ```bash
   cd server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment:**

   Create `server/.env`:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the server:**

   ```bash
   npm run dev
   ```

For production deployment, see [server/README.md](server/README.md)

## 📖 Usage

1. **Connect Wallet**: Connect your wallet using RainbowKit.
2. **Create Profile**: Enter a username and bio to register on-chain.
3. **Connect Telegram** 🆕: Click "Connect Telegram" on dashboard to receive notifications.
4. **Share Link**: Send your profile link to supporters.
5. **Receive Support**: Supporters can send USDC. If they don't have USDC on Arc, they can use the "Bridge Funds" button.
6. **Get Notified**: Receive instant Telegram alerts when someone buys you a coffee! ☕
7. **Withdraw**: Go to your dashboard to withdraw your earnings.

## 🔔 Telegram Notifications

ArcCaffeine includes a real-time notification system:

- **Instant Alerts**: Get notified immediately when you receive a donation
- **Rich Messages**: See donor name, amount, and message
- **Easy Setup**: One-click connection via deep linking
- **Status Display**: Dashboard shows connection status

### How It Works

1. Click "Connect Telegram" on dashboard
2. Authorize the bot with your wallet address
3. Receive notifications when donations arrive
4. View donation details directly in Telegram

## 📁 Project Structure

```
arc-caffaine/
├── app/                    # Next.js app directory
│   ├── dashboard/         # User dashboard
│   ├── [username]/        # Public profile pages
│   └── api/               # API routes
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and config
├── server/                # Notification server
│   ├── src/
│   │   ├── index.ts      # Main server
│   │   ├── chain.ts      # Arc Testnet config
│   │   └── abi.ts        # Contract ABI
│   └── supabase-schema.sql
└── hardhat-project/       # Smart contracts
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ on Arc Testnet
