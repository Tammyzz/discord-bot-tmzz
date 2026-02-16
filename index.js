import express from "express";
import dotenv from "dotenv";
import {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} from "discord.js";

import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  entersState,
  VoiceConnectionStatus,
  AudioPlayerStatus
} from "@discordjs/voice";

import play from "play-dl";

dotenv.config();

/* ================= WEB SERVER ================= */
const app = express();
app.get("/", (req, res) => res.send("Bot đang sống 😎"));
app.listen(process.env.PORT || 3000);

/* ================= CLIENT ================= */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel]
});

let connection;
let player = createAudioPlayer();
let stay247 = false;

/* ================= VOICE SAFE HANDLER ================= */

function connectToChannel(channel) {
  connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: true
  });

  connection.on("stateChange", async (oldState, newState) => {
    if (newState.status === VoiceConnectionStatus.Disconnected) {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5000)
        ]);
      } catch {
        connection.destroy();
        connection = null;
      }
    }
  });

  connection.subscribe(player);
}

/* ================= SLASH COMMAND ================= */

const commands = [
  new SlashCommandBuilder().setName("36").setDescription("Menu 36"),
  new SlashCommandBuilder().setName("join").setDescription("Join voice"),
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play music")
    .addStringOption(opt =>
      opt.setName("link").setDescription("Youtube link").setRequired(true)
    ),
  new SlashCommandBuilder().setName("disconnect").setDescription("Disconnect"),
  new SlashCommandBuilder().setName("247").setDescription("Stay in voice")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
await rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: commands }
);

/* ================= INTERACTION ================= */

client.on(Events.InteractionCreate, async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const channel = interaction.member.voice.channel;

  /* ===== JOIN ===== */
  if (interaction.commandName === "join") {

    if (!channel) return interaction.reply("Vào voice trước đi 🥱");

    connectToChannel(channel);
    return interaction.reply("Đã vào voice 😎");
  }

  /* ===== PLAY ===== */
  if (interaction.commandName === "play") {

    const link = interaction.options.getString("link");

    if (!channel)
      return interaction.reply("Vào voice trước đi 🥱");

    if (!connection)
      connectToChannel(channel);

    const stream = await play.stream(link);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      if (!stay247) {
        connection.destroy();
        connection = null;
      }
    });

    return interaction.reply(`Đang phát: ${link}`);
  }

  /* ===== DISCONNECT ===== */
  if (interaction.commandName === "disconnect") {
    if (connection) {
      connection.destroy();
      connection = null;
    }
    stay247 = false;
    return interaction.reply("Đã cút khỏi voice 🥱");
  }

  /* ===== 247 ===== */
  if (interaction.commandName === "247") {
    stay247 = !stay247;
    return interaction.reply(`247 mode: ${stay247 ? "ON 🔥" : "OFF"}`);
  }

});

/* ================= LOGIN ================= */
client.login(process.env.TOKEN);
