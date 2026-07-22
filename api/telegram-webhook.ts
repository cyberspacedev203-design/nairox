// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_USERNAME = process.env.TELEGRAM_CHANNEL_USERNAME;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const TELEGRAM_NOTIFICATION_CHAT_ID = process.env.TELEGRAM_NOTIFICATION_CHAT_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN environment variable");
}

if (!SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL environment variable");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const telegramApiBase = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const getChannelIdentifier = () => {
  if (TELEGRAM_CHANNEL_ID) return TELEGRAM_CHANNEL_ID;
  if (TELEGRAM_CHANNEL_USERNAME) return `@${TELEGRAM_CHANNEL_USERNAME}`;
  throw new Error("Missing TELEGRAM_CHANNEL_ID or TELEGRAM_CHANNEL_USERNAME environment variable");
};

const getNotificationChatIdentifier = () => {
  if (TELEGRAM_NOTIFICATION_CHAT_ID) return TELEGRAM_NOTIFICATION_CHAT_ID;
  return getChannelIdentifier();
};

const acceptedStatuses = new Set([
  "creator",
  "administrator",
  "member",
  "restricted",
]);

const sendTelegramMessage = async (chatId: number, text: string) => {
  await fetch(`${telegramApiBase}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const update = req.body;
  const message = update?.message;

  if (!message || !message.from || !message.from.id || !message.text) {
    return res.status(200).send("ok");
  }

  const telegramUserId = message.from.id;
  const text = String(message.text).trim();
  const startMatch = text.match(/^\/start(?:\s+(.+))?$/);

  if (!startMatch) {
    return res.status(200).send("ok");
  }

  const appUserId = startMatch[1];
  if (!appUserId) {
    await sendTelegramMessage(
      telegramUserId,
      "Please open the verification link from the website so I can verify you."
    );
    return res.status(400).json({ error: "Missing app user id" });
  }

  const channelId = getChannelIdentifier();
  const chatMemberResponse = await fetch(
    `${telegramApiBase}/getChatMember?chat_id=${encodeURIComponent(channelId)}&user_id=${telegramUserId}`
  );
  const chatMemberData = await chatMemberResponse.json();

  if (!chatMemberData.ok || !acceptedStatuses.has(chatMemberData.result?.status)) {
    await sendTelegramMessage(
      telegramUserId,
      "I could not verify that you are a member of the channel. Please join the channel and then send /start again."
    );
    return res.status(200).json({ verified: false, member: chatMemberData });
  }

  const notificationChatId = getNotificationChatIdentifier();
  const telegramUsername = message.from.username
    ? `@${message.from.username}`
    : `${message.from.first_name || ""}${message.from.last_name ? ` ${message.from.last_name}` : ""}`.trim() || `User ${telegramUserId}`;

  await sendTelegramMessage(
    notificationChatId,
    `✅ Verified: ${telegramUsername} (app user ${appUserId})`
  );

  // If you want to persist verification to your database, add a
  // telegram_verified boolean column to the profiles table and update it here.
  // Example:
  // const updateResponse = await supabase
  //   .from("profiles")
  //   .update({ telegram_verified: true })
  //   .eq("id", appUserId);
  //
  // if (updateResponse.error) {
  //   console.error("Supabase update error:", updateResponse.error);
  //   await sendTelegramMessage(
  //     telegramUserId,
  //     "You are a channel member, but I could not save verification to the database. Please contact support."
  //   );
  //   return res.status(500).json({ error: updateResponse.error });
  // }

  await sendTelegramMessage(
    telegramUserId,
    "Verification complete! You are a member of the Telegram channel. You can now continue on the website."
  );

  return res.status(200).json({ verified: true });
}
