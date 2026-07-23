// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_USERNAME = process.env.TELEGRAM_CHANNEL_USERNAME;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const TELEGRAM_NOTIFICATION_CHAT_ID = process.env.TELEGRAM_NOTIFICATION_CHAT_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
let telegramApiBase = TELEGRAM_BOT_TOKEN ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}` : null;

// Log presence (not values) of important env vars to help debug runtime configuration
console.log(
  `[telegram-webhook] env presence: TELEGRAM_BOT_TOKEN=${!!TELEGRAM_BOT_TOKEN}, SUPABASE_URL=${!!SUPABASE_URL}, SUPABASE_SERVICE_ROLE_KEY=${!!SUPABASE_SERVICE_ROLE_KEY}, TELEGRAM_CHANNEL_USERNAME=${!!TELEGRAM_CHANNEL_USERNAME}, TELEGRAM_CHANNEL_ID=${!!TELEGRAM_CHANNEL_ID}`
);

const initSupabase = () => {
  if (supabase) return supabase;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  return supabase;
};

const getChannelIdentifier = () => {
  if (TELEGRAM_CHANNEL_ID) return TELEGRAM_CHANNEL_ID;
  if (TELEGRAM_CHANNEL_USERNAME) return `@${TELEGRAM_CHANNEL_USERNAME}`;
  return null;
};

const getNotificationChatIdentifier = () => {
  if (TELEGRAM_NOTIFICATION_CHAT_ID) return TELEGRAM_NOTIFICATION_CHAT_ID;
  return getChannelIdentifier();
};

const getChannelLink = () => {
  if (TELEGRAM_CHANNEL_USERNAME) return `https://t.me/${TELEGRAM_CHANNEL_USERNAME}`;
  return null;
};

const acceptedStatuses = new Set(["creator", "administrator", "member", "restricted"]);

const sendTelegramMessage = async (chatId: number | string, text: string, extra: Record<string, any> = {}) => {
  if (!telegramApiBase) {
    console.warn("sendTelegramMessage skipped: TELEGRAM_BOT_TOKEN not set");
    return null;
  }

  try {
    await fetch(`${telegramApiBase}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, ...extra }),
    });
  } catch (e) {
    console.error("sendTelegramMessage error:", e);
  }
};

const answerCallbackQuery = async (callbackQueryId: string, text: string) => {
  if (!telegramApiBase) return null;

  try {
    await fetch(`${telegramApiBase}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
    });
  } catch (e) {
    console.error("answerCallbackQuery error:", e);
  }
};

const buildInitialKeyboard = (appUserId: string | null, channelLink: string | null) => {
  const buttons = [];

  if (channelLink) {
    buttons.push([{ text: TELEGRAM_CHANNEL_USERNAME ? `@${TELEGRAM_CHANNEL_USERNAME}` : "Open Channel", url: channelLink }]);
  }

  buttons.push([{ text: "Verify", callback_data: appUserId ? `verify:${appUserId}` : "verify" }]);

  return { inline_keyboard: buttons };
};

const verifyMembership = async ({
  chatId,
  telegramUserId,
  appUserId,
  messageFrom,
  callbackQueryId = null,
}: {
  chatId: number | string;
  telegramUserId: number;
  appUserId: string;
  messageFrom: any;
  callbackQueryId?: string | null;
}) => {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("Missing TELEGRAM_BOT_TOKEN environment variable");
    await sendTelegramMessage(chatId, "Bot is not configured yet. Please contact support.");
    return { verified: false, error: "Missing TELEGRAM_BOT_TOKEN" };
  }

  if (callbackQueryId) {
    await answerCallbackQuery(callbackQueryId, "Checking your membership...");
  }

  await sendTelegramMessage(chatId, "Checking your channel membership, please wait...");

  const channelId = getChannelIdentifier();
  if (!channelId) {
    console.error("Missing TELEGRAM_CHANNEL_ID or TELEGRAM_CHANNEL_USERNAME environment variable");
    await sendTelegramMessage(chatId, "The channel is not configured yet. Please contact support.");
    return { verified: false, error: "Missing channel identifier" };
  }

  // Wait 2 seconds for Telegram to propagate the membership change
  await new Promise((resolve) => setTimeout(resolve, 2000));

  let chatMemberData = { ok: false };
  try {
    const chatMemberResponse = await fetch(
      `${telegramApiBase}/getChatMember?chat_id=${encodeURIComponent(channelId)}&user_id=${telegramUserId}`
    );
    chatMemberData = await chatMemberResponse.json();
    console.log("[telegram-webhook] getChatMember response:", JSON.stringify(chatMemberData)?.slice(0, 500));
  } catch (e) {
    console.error("getChatMember failed:", e);
    await sendTelegramMessage(chatId, "Unable to verify membership right now. Please try again later.");
    return { verified: false, error: String(e) };
  }

  const userStatus = chatMemberData.result?.status || "unknown";
  if (!chatMemberData.ok || !acceptedStatuses.has(userStatus)) {
    const channelLink = getChannelLink();
    const statusInfo = !chatMemberData.ok ? `API error: ${chatMemberData.description}` : `Your status is: ${userStatus}`;
    const joinMessage = channelLink
      ? `You still need to join the channel. (${statusInfo})`
      : `You still need to join the channel. (${statusInfo})`;

    const keyboard = buildInitialKeyboard(appUserId, channelLink);
    await sendTelegramMessage(chatId, joinMessage, { reply_markup: keyboard });
    return { verified: false, member: chatMemberData };
  }

  // Only send confirmation to user, not to a separate notification channel

  const sb = initSupabase();
  if (!sb) {
    console.warn("Supabase not configured; skipping DB persistence for verification");
    await sendTelegramMessage(
      chatId,
      "You are a member of the channel, but server-side verification is not configured. The website cannot unlock until the site admin sets SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and runs the database migration. Please contact support."
    );
    return { verified: false, persisted: false };
  }

  try {
    const updateResponse = await sb
      .from("profiles")
      .update({ telegram_verified: true, telegram_username: messageFrom?.username || null, telegram_id: telegramUserId })
      .eq("id", appUserId);

    if (updateResponse.error) {
      console.error("Supabase update error:", updateResponse.error);
      await sendTelegramMessage(chatId, "You are a channel member, but I could not save your verification. Please contact support.");
      return { verified: false, error: updateResponse.error };
    }
  } catch (err) {
    console.error("Supabase update exception:", err);
    await sendTelegramMessage(chatId, "You are a channel member, but I could not save your verification. Please contact support.");
    return { verified: false, error: String(err) };
  }

  await sendTelegramMessage(chatId, "Verification complete! You can now continue on the website.");
  return { verified: true, persisted: true };
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const update = req.body;
  const callbackQuery = update?.callback_query;
  const message = update?.message;

  console.log("[telegram-webhook] incoming update:", JSON.stringify(update)?.slice(0, 2000));

  if (callbackQuery?.data) {
    const data = String(callbackQuery.data);
    const appUserId = data.startsWith("verify:") ? data.slice("verify:".length) : null;
    const chatId = callbackQuery.message?.chat?.id;
    const telegramUserId = callbackQuery.from?.id;

    if (!chatId || !telegramUserId || !appUserId) {
      return res.status(200).send("ok");
    }

    await verifyMembership({
      chatId,
      telegramUserId,
      appUserId,
      messageFrom: callbackQuery.from,
      callbackQueryId: callbackQuery.id,
    });

    return res.status(200).send("ok");
  }

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
    await sendTelegramMessage(telegramUserId, "Please open the verification link from the website so I can verify you.");
    return res.status(200).json({ error: "Missing app user id" });
  }

  const channelLink = getChannelLink();
  const keyboard = buildInitialKeyboard(appUserId, channelLink);
  await sendTelegramMessage(telegramUserId, "Join the channel and tap Verify below.", {
    reply_markup: keyboard,
  });

  return res.status(200).send("ok");
}
