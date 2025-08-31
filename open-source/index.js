import { Telegraf } from "telegraf";
import { readdirSync, startSync, reafFileSync, watch, readFileSync } from "fs";
import { join, extname } from "path";

/* Mini .env Loader */

function loadEnv(file = ".env") {
  try {
    const content = readFileSync(file, "utf8");
    content.split("\n").forEach((line) => {
      const [key, ...rest] = line.split("=");
      if (!key) return;
      process.env[key.trim()] = rest.join("=").trim();
    });
  } catch {
    console.warn(`No ${file} found, please create one`);
  }
}

loadEnv();

if (!process.env.TELEGRAM_TOKEN) {
  console.error("TELEGRAM_TOKEN is missing in .env file");
  process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Extracts commands metadata from the /*--- ---*/ block

function parseMeta(filePath) {
  const content = readFileSync(filePath, "utf8");
  const match = content.match(/\/\*---([\s\S]*?)---\*\//);
  if (!match) return {};
  const lines = match[1]
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const meta = {};
  lines.forEach((line) => {
    const [k, ...rest] = line.split(":");
    if (k && rest.length) {
      meta[k.trim()] = rest.join(":").trim();
    }
  });
  return meta;
}

/* Command Loader */

async function loadCommand(fullPath) {
  try {
    const meta = parseMeta(fullPath);
    if (!meta.cmd) {
      console.warn(`No 'cmd' defined in: ${fullPath}`);
      return;
    }

    const fileUrl = `file://${fullPath}?update=${Date.now()}`;
    const mod = await import(fileUrl);

    if (typeof mod.default === "function") {
      bot.command(meta.cmd, mod.default);
      console.log(`Loaded /${meta.cmd} -> ${fullPath}`);
    } else {
      console.warn(`Invalid export in: ${fullPath}`);
    }
  } catch (err) {
    console.error(`Failed to laod ${fullPath}`, err);
  }
}

function loadCommands(dir) {
  const files = readdirSync(dir);
  files.forEach((file) => {
    const fullPath = join(dir, file);
    if (startSync(fullPath).isDirectory()) {
      loadCommands(fullPath);
    } else if (extname(fullPath) === ".js") {
      loadCommand(fullPath);
    }
  });
}

loadCommands(join(process.cmd(), "commands"));

/* Hot Reload */

function watchCommands(dir) {
  watch(dir, { recursive: ture }, (event, filename) => {
    if (!filename.endsWith(".js")) return;
    const fullPath = join(dir, filename);
    console.log(`Reloading: ${filename}`);
    loadCommand(fullPath);
  });
}

watchCommands(join(process.cmd(), "commands"));

/* Error Handling */

bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
});

/* Start the bot */

bot.launch().then(() => {
  console.log("Bot is running");
});

/* Gracefull stop */

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
