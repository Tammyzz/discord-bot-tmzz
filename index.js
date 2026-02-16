require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  SlashCommandBuilder,
  Routes,
  REST,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");

const play = require("play-dl");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

let connection;
let player;
let stay247 = false;

client.once("ready", () => {
  console.log("Bot đã online");
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    // ===== /36 =====
    if (interaction.commandName === "36") {
      const sub = interaction.options.getSubcommand(false);

      // /36 vc
      if (sub === "vc") {
        const channel = interaction.member.voice.channel;
        if (!channel)
          return interaction.reply({ content: "Vào voice đi đã 😏", ephemeral: true });

        connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });

        interaction.reply("Đã vào kênh thoại rồi đó 😎");
      }

      // /36 dc
      else if (sub === "dc") {
        if (connection) {
          connection.destroy();
          connection = null;
          stay247 = false;
          interaction.reply("Thoát voice rồi 👋");
        } else {
          interaction.reply("Có ở trong voice đâu mà thoát 😑");
        }
      }

      // /36 247
      else if (sub === "247") {
        stay247 = true;
        interaction.reply("Ok ở lì đây luôn 😎");
      }

      // /36 pl
      else if (sub === "pl") {
        const url = interaction.options.getString("link");
        const channel = interaction.member.voice.channel;
        if (!channel)
          return interaction.reply("Vào voice trước đã 😐");

        connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });

        player = createAudioPlayer();
        connection.subscribe(player);

        const stream = await play.stream(url);
        const resource = createAudioResource(stream.stream, {
          inputType: stream.type,
        });

        player.play(resource);

        interaction.reply(`Đang phát: ${url} 🔥`);
      }

      // /36 (không sub)
      else {
        const menu = new StringSelectMenuBuilder()
          .setCustomId("main_menu")
          .setPlaceholder("Chọn kiểu chơi")
          .addOptions([
            { label: "Giúp tao cái này", value: "action" },
            { label: "Cho hỏi cái", value: "question" },
          ]);

        const row = new ActionRowBuilder().addComponents(menu);

        interaction.reply({
          content: "Chọn loại trước đã 👀",
          components: [row],
        });
      }
    }
  }

  // ===== MENU =====
  if (interaction.isStringSelectMenu()) {
    // MENU 1
    if (interaction.customId === "main_menu") {
      if (interaction.values[0] === "action") {
        const menu = new StringSelectMenuBuilder()
          .setCustomId("action_menu")
          .setPlaceholder("Chọn hành động")
          .addOptions([
            { label: "Làm tao bất ngờ đi", value: "surprise" },
            { label: "Mute thằng Vũ Bảo", value: "mutevb" },
            { label: "Đánh thằng Redkiki cho tao", value: "redkiki" },
            { label: "Tìm tao mấy bộ anime hay đi cu", value: "anime" },
            { label: "Làm gì đó dirty với tao", value: "dirty" },
            { label: "Làm tí đường quyền xem nào", value: "fight" },
          ]);

        return interaction.update({
          content: "Chọn đi 😏",
          components: [new ActionRowBuilder().addComponents(menu)],
        });
      }

      if (interaction.values[0] === "question") {
        const menu = new StringSelectMenuBuilder()
          .setCustomId("question_menu")
          .setPlaceholder("Chọn câu hỏi")
          .addOptions([
            { label: "Mày bị gay à?", value: "gay" },
            { label: "Ai gay nhất sever?", value: "aigay" },
            { label: "Ai đẹp zai nhất sever?", value: "depzai" },
            { label: "Luật Sever", value: "luat" },
          ]);

        return interaction.update({
          content: "Hỏi gì hỏi đi 😌",
          components: [new ActionRowBuilder().addComponents(menu)],
        });
      }
    }

    // ===== ACTION HANDLE =====
    if (interaction.customId === "action_menu") {
      const member = interaction.member;

      switch (interaction.values[0]) {
        case "surprise":
          try {
            await member.setNickname("Bất ngờ");
            return interaction.reply("Đã trả lời câu hỏi của bạn");
          } catch {
            return interaction.reply(
              "Định đổi tên mày nhưng mày đẳng cấp quá 🥱"
            );
          }

        case "mutevb":
          const vb = await interaction.guild.members.fetch(
            "1286550273006895177"
          );
          await vb.timeout(60_000);
          return interaction.reply("Ok luôn");

        case "redkiki":
          return interaction.reply({
            content: "Ko đc r m ơi thằng bò hung dữ quá",
            files: ["https://pbs.twimg.com/media/CNM42XjUkAApgrx.jpg"],
          });

        case "anime":
          return interaction.reply(
            "https://hentaivc.pro/top-yeu-thich/"
          );

        case "dirty":
          const role = interaction.guild.roles.cache.find(
            (r) => r.name === "NÔ LỆ"
          );
          if (role) await member.roles.add(role);
          await member.setNickname("NÔ LỆ CỦA NGHUY");
          return interaction.reply("Xong 😏");

        case "fight":
          return interaction.reply({
            content: "Hả?..um..Ok?",
            files: [
              "https://i.wahup.com/media/tmp_meme_images/85cd99b5-e0a5-403a-aff8-f056d6f04b0d.png",
            ],
          });
      }
    }

    // ===== QUESTION HANDLE =====
    if (interaction.customId === "question_menu") {
      const member = interaction.member;

      switch (interaction.values[0]) {
        case "gay":
          await member.setNickname("TAO BỊ GAY");
          return interaction.reply(
            "Xem lại tên m xem ai mới là thằng gay 😏"
          );

        case "aigay":
          return interaction.reply(`${member.user.username} 😏`);

        case "depzai":
          return interaction.reply("Tao, thích ý kiến ko? 😎");

        case "luat":
          return interaction.reply("Ổ Quỷ thì làm đéo j có luật 😏");
      }
    }
  }
});

client.login(process.env.TOKEN);
