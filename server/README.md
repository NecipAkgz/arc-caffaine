# ArcCaffeine Notification Server

Telegram bot and blockchain event listener for sending donation notifications.

## Setup

1. **Set up Supabase database:**
   - Go to your Supabase dashboard
   - Open SQL Editor
   - Run the `supabase-schema.sql` file in this directory
   - Copy your Project URL and anon key from Settings → API

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials
   - Bot token is already configured

4. **Run locally:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Deployment (Render)

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set the following:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add environment variables in Render dashboard:
   - `TELEGRAM_BOT_TOKEN`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

## How It Works

1. **Bot Linking:** Users click "Connect Telegram" on dashboard → Opens bot with deep link → Bot saves wallet-to-chat mapping in Supabase
2. **Event Listening:** Server watches Arc Testnet for `NewMemo` events
3. **Notifications:** When donation detected → Lookup recipient's Telegram → Send notification

## Environment Variables

- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token from @BotFather
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
