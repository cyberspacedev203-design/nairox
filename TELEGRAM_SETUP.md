# Telegram Verification Setup Guide

## Step 1: Create Telegram Bot via BotFather

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Follow the prompts to name your bot (e.g., "Nairox9ja Verify Bot")
4. BotFather will give you a **bot token**: `123456789:ABCDefGHIjklMNOpqrSTUvwxYZ`
5. Keep this token safe — you'll use it in Vercel env vars

## Step 2: Add Bot to Your Telegram Channel

1. Open your Telegram channel (`@Nairox9janews`)
2. Click on channel name → Members → Add member
3. Search for your bot and add it as a member (preferably as admin so it can check membership)

## Step 3: Get Channel Details

For a **public channel** (e.g., `@Nairox9janews`):
- Use: `TELEGRAM_CHANNEL_USERNAME = Nairox9janews`

For a **private channel**:
- Get the chat ID by adding the bot and running: `/start`
- The ID looks like: `-1001234567890`
- Use: `TELEGRAM_CHANNEL_ID = -1001234567890`

## Step 4: Set Up Webhook in Vercel

1. Get your bot username from BotFather (e.g., `@nairox9ja_verify_bot` or just `nairox9ja_verify_bot`)
2. In your Telegram bot settings (via BotFather), set the webhook URL:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<your-vercel-app>.vercel.app/api/telegram-webhook
   ```
   Replace:
   - `<YOUR_BOT_TOKEN>` with your bot token
   - `<your-vercel-app>` with your actual Vercel project name

## Step 5: Add Vercel Environment Variables

In your Vercel project settings, add these env vars:

```
TELEGRAM_BOT_TOKEN=123456789:ABCDefGHIjklMNOpqrSTUvwxYZ
TELEGRAM_CHANNEL_USERNAME=Nairox9janews
TELEGRAM_CHANNEL_ID=
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

(Use only `TELEGRAM_CHANNEL_USERNAME` for public channels, or only `TELEGRAM_CHANNEL_ID` for private channels.)

## Step 6: Add Frontend Environment Variable

Create or update `.env.local` in your project root:

```
VITE_TELEGRAM_BOT_USERNAME=nairox9ja_verify_bot
```

Replace `nairox9ja_verify_bot` with your actual bot username (without `@`).

## How It Works

1. User sees welcome modal on dashboard
2. Clicks "Verify with Bot 🤖"
3. Deep link opens: `https://t.me/nairox9ja_verify_bot?start=<userId>`
4. User sends `/start` in the bot
5. Bot checks if user is in your channel via `getChatMember` API
6. If verified, user can close the bot and click "I have verified ✓"
7. Modal closes and user can access the dashboard

## Testing

1. Create a test user account
2. Join your Telegram channel
3. Go to dashboard — the welcome modal should appear
4. Click "Verify with Bot 🤖"
5. The bot link should open
6. Send `/start` to the bot
7. Bot should confirm verification
8. Click "I have verified ✓" and the modal should close

## Files Modified

- `api/telegram-webhook.ts` — Telegram webhook handler
- `src/components/WelcomeModal.tsx` — Frontend deep-link flow
