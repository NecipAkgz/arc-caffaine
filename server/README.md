<div align="center">
  <img src="https://img.icons8.com/fluency/96/console.png" alt="Server Logo" width="100"/>
  <br />
  <h1>ArcCaffeine Notification Server</h1>

  <p>
    <strong>The Real-Time Neural Link for ArcCaffeine Notifications</strong>
  </p>

  <p>
    <a href="#"><img src="https://img.shields.io/badge/Service-Telegram_Bot-0EA5E9?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram Bot" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Status-Online-22C55E?style=for-the-badge&logo=activity&logoColor=white" alt="Status Online" /></a>
    <a href="../LICENSE"><img src="https://img.shields.io/badge/License-MIT-A855F7?style=for-the-badge&logo=basecamp&logoColor=white" alt="License MIT" /></a>
  </p>
</div>

---

## ▸ Overview

The **Notification Server** operates as the bridge between on-chain events and off-chain user alerts. It listens for `NewMemo` events on the Arc Testnet and instantly forwards them to creators via Telegram.

---

## ▸ Architecture

### 🔄 Data Flow
1. **Bot Linking** → Users authenticate via Deep Link (`/start <wallet>`) → Server maps Wallet ↔ Chat ID in Supabase.
2. **Event Sentinel** → Viem watcher monitors Arc Testnet for `NewMemo` logs.
3. **Dispatch** → On event detection, server queries Supabase for the recipient and fires a Telegram message.

---

## ▸ Infrastructure

<div align="left">
  <img src="https://skillicons.dev/icons?i=nodejs,ts,supabase,docker&theme=dark" alt="Server Stack" />
  <br />
  <br />
</div>

- **Runtime:** Node.js + TypeScript
- **Database:** Supabase (PostgreSQL)
- **Blockchain:** Viem (Event Listening)
- **Deployment:** Render / Docker

---

## ▸ Setup Guide

### 1. Database Initialization
- Access your **Supabase Dashboard**.
- Open the SQL Editor.
- Execute the contents of `supabase-schema.sql`.
- Retrieve your **Project URL** and **Anon Key**.

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file based on `.env.example`:

```env
TELEGRAM_BOT_TOKEN=your_token
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

### 4. Ignite
```bash
npm run dev
```

---

## ▸ Deployment (Render)

1. **New Web Service** → Connect your repo.
2. **Settings:**
    - Root Directory: `server`
    - Build Command: `npm install && npm run build`
    - Start Command: `npm start`
3. **Variables:** Add your configured environment variables.
