# ArcCaffeine ☕️

**ArcCaffeine** is a decentralized "Buy Me a Coffee" platform built on the **Arc Blockhain Testnet**. It empowers creators to receive support in **USDC** directly from their fans, with a seamless user experience that includes profile customization and an integrated cross-chain bridge.

## 🌟 Features

- **User Profiles**: Create a unique profile with a custom username (`@username`) and bio.
- **Public Pages**: Share your personalized link (e.g., `app.com/necip`) to receive support.
- **USDC Donations**: Receive donations in USDC directly on the Arc Testnet.
- **Integrated Bridge**: Built-in **Circle BridgeKit** integration allows users to bridge USDC from Sepolia, Base Sepolia, and other testnets to Arc Testnet without leaving the app.
- **Dashboard**: Track your earnings, view recent messages, and withdraw funds to your wallet.
- **Responsive Design**: A modern, dark-themed UI built with Tailwind CSS that works great on all devices.

## 🛠 Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Blockchain Interaction**: [Wagmi](https://wagmi.sh/) & [Viem](https://viem.sh/)
- **Wallet Connection**: [RainbowKit](https://www.rainbowkit.com/)
- **Cross-Chain Bridge**: [Circle BridgeKit](https://developers.circle.com/w3s/bridge-kit)
- **Smart Contract**: Solidity (Deployed on Arc Testnet)

## 🔗 Smart Contract

The ArcCaffeine smart contract handles user registration, donations, and withdrawals.

- **Contract Address**: [`0xcC7F8BD425265EA2619B0876B76487B824D57c2d`](https://testnet.arcscan.app/address/0xcC7F8BD425265EA2619B0876B76487B824D57c2d)
- **Network**: Arc Testnet

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js 18+ installed.
- A WalletConnect Project ID (get one at [cloud.walletconnect.com](https://cloud.walletconnect.com)).

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/arc-caffaine.git
   cd arc-caffaine
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure Environment:**

   Open `lib/config.ts` and replace the `projectId` with your own WalletConnect Project ID if necessary.

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open the app:**

   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

1. **Connect Wallet**: Connect your wallet using RainbowKit.
2. **Create Profile**: Enter a username and bio to register on-chain.
3. **Share Link**: Send your profile link to supporters.
4. **Receive Support**: Supporters can send USDC. If they don't have USDC on Arc, they can use the "Bridge Funds" button to transfer assets from other testnets.
5. **Withdraw**: Go to your dashboard to withdraw your earnings.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
