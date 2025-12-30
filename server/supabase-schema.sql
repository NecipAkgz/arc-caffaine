-- Create the user_notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  wallet_address TEXT PRIMARY KEY,
  telegram_chat_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_wallet_address ON user_notifications(wallet_address);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations" ON user_notifications
  FOR ALL
  USING (true)
  WITH CHECK (true);
