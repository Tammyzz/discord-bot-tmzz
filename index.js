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
  createAudioResource
} from "@discordjs/voice";

import play from "play-dl";

dotenv.config();

/* ================= WEB SERVER (CHO RAILWAY KHỎI NGỦ) ================= */
const app = express();
app.get("/", (req, res) => res.send("Bot đang sống 😎"));
app.listen(process.env.PORT || 3000);

/* ================= DISCORD CLIENT ================= */
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

  /* ===== SLASH COMMAND ===== */
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "36") {

      const actionMenu = new StringSelectMenuBuilder()
        .setCustomId("action_menu")
        .setPlaceholder("Giúp tao cái này")
        .addOptions([
          { label: "Làm tao bất ngờ đi", value: "batngo" },
          { label: "Mute thằng Vũ Bảo", value: "mutevb" },
          { label: "Đánh thằng Redkiki cho tao", value: "redkiki" },
          { label: "Tìm tao mấy bộ anime hay đi cu", value: "anime" },
          { label: "Làm gì đó dirty với tao", value: "dirty" },
          { label: "Làm tí đường quyền xem nào", value: "duongquyen" },
          { label: "Give me a pic of your big ass", value: "bigass" },
          { label: "Đổi tên LHuy thành KhiemMocCu", value: "doilhuy" },
          { label: "Cho t một tấm ảnh của Sử Ngu yên", value: "sungu" },
          { label: "Cho t một tấm ảnh của Vũ Bảo", value: "vubao" },
          { label: "Nhảy đi", value: "nhay" }
        ]);

      const questionMenu = new StringSelectMenuBuilder()
        .setCustomId("question_menu")
        .setPlaceholder("Cho hỏi cái")
        .addOptions([
          { label: "Mày bị gay à?", value: "gay" },
          { label: "Ai gay nhất sever?", value: "aigay" },
          { label: "Ai đẹp zai nhất sever?", value: "depzai" },
          { label: "Luật Sever", value: "luat" },
          { label: "Quy tắc Logarit của 1 tích là gì", value: "log" },
          { label: "Alo, Vũ à Vũ?", value: "alo" },
          { label: "M có yêu t ko", value: "yeu" }
        ]);

      await interaction.reply({
        content: "Chọn đi 😏",
        components: [
          new ActionRowBuilder().addComponents(actionMenu),
          new ActionRowBuilder().addComponents(questionMenu)
        ]
      });
    }

    /* ===== JOIN ===== */
    if (interaction.commandName === "join") {
      const channel = interaction.member.voice.channel;
      if (!channel) return interaction.reply("Vào voice trước đi 🥱");

      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
      });

      interaction.reply("Đã vào voice 😎");
    }

    /* ===== PLAY ===== */
    if (interaction.commandName === "play") {
      const link = interaction.options.getString("link");
      if (!connection) return interaction.reply("Bot chưa vào voice 🥱");

      const stream = await play.stream(link);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      player.play(resource);
      connection.subscribe(player);

      interaction.reply(`Đang phát: ${link}`);
    }

    /* ===== DISCONNECT ===== */
    if (interaction.commandName === "disconnect") {
      if (connection) {
        connection.destroy();
        connection = null;
        stay247 = false;
        interaction.reply("Đã cút khỏi voice 🥱");
      }
    }

    /* ===== 247 ===== */
    if (interaction.commandName === "247") {
      stay247 = !stay247;
      interaction.reply(`247 mode: ${stay247 ? "ON" : "OFF"}`);
    }
  }

  /* ===== MENU HANDLE ===== */
  if (interaction.isStringSelectMenu()) {
    const member = interaction.member;

    try {
      switch (interaction.values[0]) {

        case "batngo":
          await member.setNickname("Bất ngờ");
          return interaction.reply("Done 😏");

        case "mutevb":
          const vb = await interaction.guild.members.fetch("1286550273006895177");
          await vb.voice.setMute(true);
          return interaction.reply("Ok luôn 😏");

        case "redkiki":
          return interaction.reply({
            content: "Ko đc r m ơi thằng bò hung dữ quá",
            files: ["https://pbs.twimg.com/media/CNM42XjUkAApgrx.jpg"]
          });

        case "anime":
          return interaction.reply("https://hentaivc.pro/top-yeu-thich/");

        case "dirty":
          const role = interaction.guild.roles.cache.find(r => r.name === "NÔ LỆ");
          if (role) await member.roles.add(role);
          await member.setNickname("NÔ LỆ CỦA NGHUY");
          return interaction.reply("Xong 😏");

        case "duongquyen":
          return interaction.reply("https://i.wahup.com/media/tmp_meme_images/85cd99b5-e0a5-403a-aff8-f056d6f04b0d.png");

        case "bigass":
          return interaction.reply("https://furrycdn.org/img/2023/5/4/240212/large.png");

        case "doilhuy":
          const lhuy = await interaction.guild.members.fetch("813707010129920040");
          await lhuy.setNickname("KhiemMocCu");
          return interaction.reply("Đã đổi 😏");

        case "sungu":
          return interaction.reply("https://media.tenor.com/p7ZA5XsSE7IAAAAM/bamboozled-astonished.gif");

        case "vubao":
          return interaction.reply("https://media.tenor.com/6ywOzKRf_IwAAAAM/patrick-star.gif");

        case "nhay":
          return interaction.reply({
            content: "Hả?..um..Ok?",
            files: ["https://media.tenor.com/4HkLW40pwKgAAAAm/patrick-patrick-star.webp"]
          });

        case "gay":
          await member.setNickname("TAO BỊ GAY");
          return interaction.reply("Xem lại tên m xem ai mới là thằng gay 😏");

        case "aigay":
          return interaction.reply(`${member.user.username} 😏`);

        case "depzai":
          return interaction.reply("Tao, thích ý kiến ko? 😎");

        case "luat":
          return interaction.reply("Ổ Quỷ thì làm đéo j có luật 😏");

        case "log":
          return interaction.reply("log_α(ab) = log_αa + log_αb");

        case "alo":
          return interaction.reply({
            content: "Nhầm số r anh ơi",
            files: ["https://cdn.24h.com.vn/upload/2-2023/images/2023-04-02/1680403207-nam-streamer-do-mixi-giau-co-nao-hinh-3-width600height400.jpeg"]
          });

        case "yeu":
          return interaction.reply("Duy Anh yêu tất cả mọi người.. https://media.tenor.com/-Udld9YEr0EAAAAM/sonic-zesty.gif");
      }

    } catch (err) {
      return interaction.reply("Định đổi tên mày nhưng mày đẳng cấp quá 🥱");
    }
  }
});

client.login(process.env.TOKEN);
