-- Add instant activation tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instant_activation_paid BOOLEAN DEFAULT FALSE;

-- Create table for instant withdrawal activation payments (toggle ON flow)
CREATE TABLE IF NOT EXISTS instant_activation_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 12600.00,
  receipt_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE instant_activation_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own instant activation payments"
  ON instant_activation_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own instant activation payments"
  ON instant_activation_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);