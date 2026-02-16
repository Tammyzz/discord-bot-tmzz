const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Routes,
  REST,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

const express = require("express");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ===== WEB SERVER =====
const app = express();
app.get("/", (req, res) => {
  res.send("Bot đang sống 😎");
});
app.listen(process.env.PORT || 3000, () => {
  console.log("Web server đang chạy");
});

// ===== READY =====
client.once(Events.ClientReady, () => {
  console.log(`Bot đã online: ${client.user.tag}`);
});

// ===== SLASH COMMAND =====
const commands = [
  new SlashCommandBuilder()
    .setName("36")
    .setDescription("Muốn hỏi cái giề?")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("Đăng ký l

