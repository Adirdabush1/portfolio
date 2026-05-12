// One-time interactive login. Run LOCALLY (not on Render).
//   cd backend && node scripts/telegram-login.js
//
// Prompts for api_id, api_hash, phone, SMS code (and optional 2FA password).
// Writes TELEGRAM_API_ID / TELEGRAM_API_HASH / TELEGRAM_SESSION to .env.
//
// The TELEGRAM_SESSION string is sensitive: anyone with it can read your
// messages. Keep it in .env (gitignored) and as a Render secret env var.

const fs = require("fs");
const path = require("path");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const ENV_PATH = path.resolve(__dirname, "..", ".env");

const upsertEnv = (key, value) => {
  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf-8") : "";
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(content)) {
    content = content.replace(re, `${key}=${value}`);
  } else {
    if (content && !content.endsWith("\n")) content += "\n";
    content += `${key}=${value}\n`;
  }
  fs.writeFileSync(ENV_PATH, content);
};

(async () => {
  console.log("\n=== Telegram MTProto login ===\n");
  console.log("You will be asked for credentials. Nothing leaves this terminal.\n");

  const apiId = parseInt(await input.text("api_id (number from my.telegram.org): "), 10);
  const apiHash = await input.text("api_hash (32-char hex): ");
  const phone = await input.text("phone number (e.g. +972501234567): ");

  const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => phone,
    password: async () => await input.password("2FA password (leave empty if none): "),
    phoneCode: async () => await input.text("SMS / Telegram code: "),
    onError: (err) => console.error("Telegram login error:", err.message),
  });

  const session = client.session.save();
  console.log("\nSession length:", session.length, "chars");

  upsertEnv("TELEGRAM_API_ID", String(apiId));
  upsertEnv("TELEGRAM_API_HASH", apiHash);
  upsertEnv("TELEGRAM_SESSION", session);
  console.log("Wrote TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION to .env");

  const me = await client.getMe();
  console.log(`\nLogged in as: ${me.firstName || ""} ${me.lastName || ""} (@${me.username || "no-username"})`);
  await client.disconnect();
  console.log("Done. You can now use the Telegram channel scraper.\n");
  process.exit(0);
})().catch((err) => {
  console.error("\nFAILED:", err.message);
  process.exit(1);
});
