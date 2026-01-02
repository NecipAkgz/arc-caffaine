<div align="center">
  <h1>ArcCaffeine ☕️</h1>

  <p>
    <strong>The Decentralized "Buy Me a Coffee" Platform for the Arc Ecosystem</strong>
  </p>

  <a href="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&pause=1000&color=0EA5E9&center=true&vCenter=true&width=500&lines=Decentralized+Support+in+USDC;Seamless+Cross-Chain+Bridge;Real-time+Telegram+Alerts;Built+on+Arc+Testnet">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&pause=1000&color=0EA5E9&center=true&vCenter=true&width=500&lines=Decentralized+Support+in+USDC;Seamless+Cross-Chain+Bridge;Real-time+Telegram+Alerts;Built+on+Arc+Testnet" alt="Typing SVG" />
  </a>

  <p>
    <a href="https://testnet.arcscan.app/address/0xcC7F8BD425265EA2619B0876B76487B824D57c2d"><img src="https://img.shields.io/badge/Network-Arc_Testnet-0EA5E9?style=for-the-badge&logo=squarespace&logoColor=white" alt="Arc Testnet" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Status-Active-22C55E?style=for-the-badge&logo=activity&logoColor=white" alt="Status Active" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-A855F7?style=for-the-badge&logo=basecamp&logoColor=white" alt="License MIT" /></a>
  </p>
</div>

---

## ▸ About

**ArcCaffeine** empowers creators to receive support in **USDC** directly from their fans on the Arc Blockchain Testnet. With a seamless user experience, it combines profile customization, a built-in cross-chain bridge, and instant Telegram notifications to keep you connected with your supporters.

---

## ▸ Key Features

### ✨ Core Experience
- **Unique User Profiles** → Create your custom `@username` identity.
- **Direct USDC Support** → Receive donations instantly with low fees.
- **Creator Search** → Easily discover creators via the dashboard.

### ⚡ Power Tools
- **Integrated Bridge** → Built-in **Circle BridgeKit** allows users to bridge USDC from Sepolia, Base Sepolia, and other testnets without leaving the app.
- **Telegram Sentinel** → Get real-time alerts for every coffee bought.
- **Dashboard Analytics** → Track earnings and manage withdrawals throughout.

---

## ▸ Tech Stack

<div align="left">
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,supabase,nodejs,solidity,hardhat&theme=dark" alt="Tech Stack" />
</div>

### 🎨 Frontend
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS (Premium Dark Mode)
- **Web3:** Wagmi, Viem, RainbowKit

### ⚙️ Backend
- **Server:** Node.js + TypeScript
- **Database:** Supabase
- **Notifications:** Telegram Bot API
- **Events:** Viem (Blockchain Listener)

---

## ▸ Smart Contract

The backbone of ArcCaffeine, handling decentralized registration and payments.

> **Contract Address:** [`0xcC7F8BD425265EA2619B0876B76487B824D57c2d`](https://testnet.arcscan.app/address/0xcC7F8BD425265EA2619B0876B76487B824D57c2d)

---

## ▸ Workflow & Notifications

### 📖 User Journey
1. **Connect & Create** → Connect wallet (RainbowKit) and register your unique `@username`.
2. **Sentinel Setup** 🆕 → Click **"Connect Telegram"** on the dashboard to link your account.
3. **Share & Receive** → Share your profile link. Supporters send USDC (via Arc or Bridge).
4. **Instant Alerts** 🔔 → Get real-time Telegram notifications with donor name, amount, and message.
5. **Withdraw** → Claim your earnings directly from the dashboard.

### 🔔 Telegram Sentinel
**ArcCaffeine** features a premium real-time notification system.
- **Instant Alerts** → Zero-latency notifications for every donation.
- **Rich Context** → View donor identity, amount, and personal messages.
- **Dashboard Integration** → Live status indicator and one-click deep link setup.

---

## ▸ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/NecipAkgz/arc-caffaine.git
cd arc-caffaine
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 3. Launch

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app in action.

### 4. Notification Server (Optional)
For setting up the Telegram notification bot, please refer to the [Notification Server Documentation](server/README.md).

---

## ▸ Project Structure

```
arc-caffaine/
├── app/                  # Next.js App Router
├── components/           # UI Components
├── hooks/                # Custom Web3 Hooks
├── lib/                  # Utilities
├── server/               # Notification Service
└── hardhat-project/      # Smart Contracts
```

---

<div align="center">
  <p>
    Built with ❤️ by <a href="https://github.com/NecipAkgz">Necip Akgz</a>
  </p>
</div>
