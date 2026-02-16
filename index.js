import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} from "discord.js";

import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection
} from "@discordjs/voice";

import play from "play-dl";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ]
});

let player = createAudioPlayer();
let connection = null;
let stay247 = false;

/* ================= READY ================= */

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder().setName("36").setDescription("Menu Chaos"),
    new SlashCommandBuilder().setName("join").setDescription("Join voice"),
    new SlashCommandBuilder()
      .setName("play")
      .setDescription("Play nhạc")
      .addStringOption(opt =>
        opt.setName("link").setDescription("Youtube link").setRequired(true)
      ),
    new SlashCommandBuilder().setName("disconnect").setDescription("Out voice"),
    new SlashCommandBuilder().setName("247").setDescription("Toggle 24/7 mode")
  ].map(cmd => cmd.toJSON());

  await client.application.commands.set(commands);
});

/* ================= INTERACTION ================= */

client.on("interactionCreate", async interaction => {

  if (interaction.isChatInputCommand()) {

    /* ===== JOIN ===== */
    if (interaction.commandName === "join") {
      if (!interaction.member.voice.channel)
        return interaction.reply("M chưa vô voice kìa");

      connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
      });

      connection.subscribe(player);
      return interaction.reply("Vào rồi 😏");
    }

    /* ===== PLAY ===== */
    if (interaction.commandName === "play") {

      if (!interaction.member.voice.channel)
        return interaction.reply("M chưa vào voice");

      if (!connection) {
        connection = joinVoiceChannel({
          channelId: interaction.member.voice.channel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator
        });
        connection.subscribe(player);
      }

      const link = interaction.options.getString("link");

      const stream = await play.stream(link);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      player.play(resource);

      return interaction.reply(`Đang phát: ${link}`);
    }

    /* ===== DISCONNECT ===== */
    if (interaction.commandName === "disconnect") {
      stay247 = false;
      const conn = getVoiceConnection(interaction.guild.id);
      if (conn) conn.destroy();
      return interaction.reply("Out rồi 😴");
    }

    /* ===== 247 ===== */
    if (interaction.commandName === "247") {
      stay247 = !stay247;
      return interaction.reply(`247 mode: ${stay247 ? "ON" : "OFF"}`);
    }

    /* ===== 36 MENU ===== */
    if (interaction.commandName === "36") {

      const actionMenu = new StringSelectMenuBuilder()
        .setCustomId("action")
        .setPlaceholder("Giúp tao cái này")
        .addOptions([
          { label: "Làm tao bất ngờ đi", value: "batngo" },
          { label: "Mute thằng Vũ Bảo", value: "mute_vubao" },
          { label: "Đánh thằng Redkiki cho tao", value: "danh_redkiki" },
          { label: "Tìm tao mấy bộ anime hay đi cu", value: "anime" },
          { label: "Làm gì đó dirty với tao", value: "dirty" },
          { label: "Làm tí đường quyền xem nào", value: "duongquyen" },
          { label: "Give me a pic of your big ass", value: "bigass" },
          { label: "Đổi tên LHuy thành KhiemMocCu", value: "doiten_lhuy" },
          { label: "Cho t một tấm ảnh của Sử Ngu yên", value: "sunguyen" },
          { label: "Cho t một tấm ảnh của Vũ Bảo", value: "anh_vubao" },
          { label: "Nhảy đi", value: "nhay" }
        ]);

      const questionMenu = new StringSelectMenuBuilder()
        .setCustomId("question")
        .setPlaceholder("Cho hỏi cái")
        .addOptions([
          { label: "Mày bị gay à?", value: "gay" },
          { label: "Ai gay nhất sever?", value: "aigay" },
          { label: "Ai đẹp zai nhất sever?", value: "depzai" },
          { label: "Luật Sever", value: "luat" },
          { label: "Quy tắc Logarit của 1 tích là gì", value: "log" },
          { label: "Alo, Vũ à Vũ?", value: "alo_vu" },
          { label: "M có yêu t ko", value: "yeu" }
        ]);

      return interaction.reply({
        content: "Chọn đi 😏",
        components: [
          new ActionRowBuilder().addComponents(actionMenu),
          new ActionRowBuilder().addComponents(questionMenu)
        ]
      });
    }
  }

  /* ================= SELECT HANDLE ================= */

  if (interaction.isStringSelectMenu()) {

    const selected = interaction.values[0];
    const member = interaction.member;
    const label = interaction.component.options.find(o => o.value === selected).label;

    const headerAction = `**Đã thực hiện hành động:** *${label}*\n\n`;
    const headerQuestion = `**Đã trả lời câu hỏi:** *${label}*\n\n`;

    try {

      if (interaction.customId === "action") {

        if (selected === "batngo") {
          await member.setNickname("Bất ngờ");
          return interaction.reply(headerAction + "Done 😏");
        }

        if (selected === "mute_vubao") {
          const target = await interaction.guild.members.fetch("1286550273006895177");
          await target.voice.setMute(true);
          return interaction.reply(headerAction + "Ok luôn");
        }

        if (selected === "danh_redkiki")
          return interaction.reply(headerAction +
            "Ko đc r m ơi thằng bò hung dữ quá\nhttps://pbs.twimg.com/media/CNM42XjUkAApgrx.jpg");

        if (selected === "anime")
          return interaction.reply(headerAction +
            "https://hentaivc.pro/top-yeu-thich/");

        if (selected === "dirty") {
          const role = interaction.guild.roles.cache.find(r => r.name === "NÔ LỆ");
          if (role) await member.roles.add(role);
          await member.setNickname("NÔ LỆ CỦA NGHUY");
          return interaction.reply(headerAction + "Done 😏");
        }

        if (selected === "duongquyen")
          return interaction.reply(headerAction +
            "https://i.wahup.com/media/tmp_meme_images/85cd99b5-e0a5-403a-aff8-f056d6f04b0d.png");

        if (selected === "bigass")
          return interaction.reply(headerAction +
            "https://furrycdn.org/img/2023/5/4/240212/large.png");

        if (selected === "doiten_lhuy") {
          const target = await interaction.guild.members.fetch("813707010129920040");
          await target.setNickname("KhiemMocCu");
          return interaction.reply(headerAction + "Done 😏");
        }

        if (selected === "sunguyen")
          return interaction.reply(headerAction +
            "https://media.tenor.com/p7ZA5XsSE7IAAAAM/bamboozled-astonished.gif");

        if (selected === "anh_vubao")
          return interaction.reply(headerAction +
            "https://media.tenor.com/6ywOzKRf_IwAAAAM/patrick-star.gif");

        if (selected === "nhay")
          return interaction.reply(headerAction +
            "Hả?..um..Ok?\nhttps://media.tenor.com/4HkLW40pwKgAAAAm/patrick-patrick-star.webp");
      }

      if (interaction.customId === "question") {

        if (selected === "gay") {
          await member.setNickname("TAO BỊ GAY");
          return interaction.reply(headerQuestion +
            "Xem lại tên m xem ai mới là thằng gay 😏");
        }

        if (selected === "aigay")
          return interaction.reply(headerQuestion +
            `${member.user.username} 😏`);

        if (selected === "depzai")
          return interaction.reply(headerQuestion +
            "Tao, thích ý kiến ko? 😎");

        if (selected === "luat")
          return interaction.reply(headerQuestion +
            "Ổ Quỷ thì làm đéo j có luật 😏");

        if (selected === "log")
          return interaction.reply(headerQuestion +
            "Đĩ, Quy tắc công thức Logarit của 1 tích là log_α(ab) = log_αa + log_αb");

        if (selected === "alo_vu")
          return interaction.reply(headerQuestion +
            "Nhầm số r anh ơi\nhttps://cdn.24h.com.vn/upload/2-2023/images/2023-04-02/1680403207-nam-streamer-do-mixi-giau-co-nao-hinh-3-width600height400.jpeg");

        if (selected === "yeu")
          return interaction.reply(headerQuestion +
            "Duy Anh yêu tất cả mọi người..\nhttps://media.tenor.com/-Udld9YEr0EAAAAM/sonic-zesty.gif");
      }

    } catch {
      return interaction.reply("Định đổi tên mày nhưng mày đẳng cấp quá 🥱");
    }
  }
});

/* ===== AUTO LEAVE IF NOT 247 ===== */

player.on(AudioPlayerStatus.Idle, () => {
  if (!stay247 && connection) {
    setTimeout(() => {
      if (!stay247) {
        connection.destroy();
        connection = null;
      }
    }, 120000);
  }
});

client.login(process.env.TOKEN);
