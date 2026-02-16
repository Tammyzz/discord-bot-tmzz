const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Routes,
  REST,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
} = require("@discordjs/voice");

const play = require("play-dl");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

let player;

/* ================= REGISTER GLOBAL COMMAND ================= */

const commands = [
  new SlashCommandBuilder().setName("vc").setDescription("Vào voice"),
  new SlashCommandBuilder().setName("dc").setDescription("Thoát voice"),
  new SlashCommandBuilder().setName("247").setDescription("Ở lì trong voice"),
  new SlashCommandBuilder()
    .setName("pl")
    .setDescription("Phát nhạc")
    .addStringOption(opt =>
      opt.setName("link").setDescription("Link YouTube").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("36")
    .setDescription("Menu chính"),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("Đã đăng ký GLOBAL command");
})();

client.once("clientReady", () => {
  console.log("Bot đã online");
});

/* ================= INTERACTION ================= */

client.on("interactionCreate", async (interaction) => {

  /* ===== SLASH ===== */

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "vc") {
      const channel = interaction.member.voice.channel;
      if (!channel) return interaction.reply("Vào voice trước 😏");

      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      return interaction.reply("Đã vào voice 😎");
    }

    if (interaction.commandName === "dc") {
      const conn = getVoiceConnection(interaction.guild.id);
      if (!conn) return interaction.reply("Có ở voice đâu 😑");
      conn.destroy();
      return interaction.reply("Thoát voice 👋");
    }

    if (interaction.commandName === "247") {
      return interaction.reply("Ok ở lì đây 😎");
    }

    if (interaction.commandName === "pl") {
      const link = interaction.options.getString("link");
      const channel = interaction.member.voice.channel;
      if (!channel) return interaction.reply("Vào voice trước 😐");

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      player = createAudioPlayer();
      connection.subscribe(player);

      await interaction.reply("Đang tải...");

      const stream = await play.stream(link);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });

      player.play(resource);

      return interaction.followUp("Đang phát 🔥");
    }

    if (interaction.commandName === "36") {
      const menu = new StringSelectMenuBuilder()
        .setCustomId("main_menu")
        .setPlaceholder("Chọn kiểu chơi")
        .addOptions([
          { label: "Giúp tao cái này", value: "action" },
          { label: "Cho hỏi cái", value: "question" },
        ]);

      return interaction.reply({
        content: "Chọn loại trước 👀",
        components: [new ActionRowBuilder().addComponents(menu)],
      });
    }
  }

  /* ================= MENU ================= */

  if (interaction.isStringSelectMenu()) {

    /* MAIN */

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
            { label: "Give me a pic of your big ass", value: "bigass" },
            { label: "Đổi tên LHuy thành KhiemMocCu", value: "renameLHuy" },
            { label: "Cho t một tấm ảnh của Sử Ngu yên", value: "sunguyen" },
            { label: "Cho t một tấm ảnh của Vũ Bảo", value: "vubao" },
            { label: "Nhảy đi", value: "nhay" },
          ]);

        return interaction.update({
          content: "Chọn hành động 😏",
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
            { label: "Quy tắc Logarit của 1 tích là gì", value: "log" },
            { label: "Alo, Vũ à Vũ?", value: "alo" },
            { label: "M có yêu t ko", value: "love" },
          ]);

        return interaction.update({
          content: "Hỏi gì hỏi đi 😌",
          components: [new ActionRowBuilder().addComponents(menu)],
        });
      }
    }

    /* ACTION HANDLE */

    if (interaction.customId === "action_menu") {

      const member = interaction.member;
      const selected = interaction.values[0];

      const safeNick = async (user, name) => {
        try {
          await user.setNickname(name);
          return true;
        } catch {
          await interaction.reply("Định đổi tên mày nhưng mày đẳng cấp quá 🥱");
          return false;
        }
      };

      switch (selected) {

        case "surprise":
          if (await safeNick(member, "Bất ngờ"))
            return interaction.reply("⚡ Hành động:\n> Làm tao bất ngờ đi");
          break;

        case "mutevb":
          const vb = await interaction.guild.members.fetch("1286550273006895177");
          await vb.timeout(60_000);
          return interaction.reply("⚡ Hành động:\n> Mute thằng Vũ Bảo\n\nOk luôn");

        case "redkiki":
          return interaction.reply({
            content: "⚡ Hành động:\n> Đánh thằng Redkiki cho tao\n\nKo đc r m ơi thằng bò hung dữ quá",
            files: ["https://pbs.twimg.com/media/CNM42XjUkAApgrx.jpg"],
          });

        case "anime":
          return interaction.reply("⚡ Hành động:\n> Tìm tao mấy bộ anime hay đi cu\n\n(Top 10 hentai theo MyAnimeList...)");

        case "dirty":
          const role = interaction.guild.roles.cache.find(r => r.name === "NÔ LỆ");
          if (role) await member.roles.add(role);
          if (await safeNick(member, "NÔ LỆ CỦA NGHUY"))
            return interaction.reply("⚡ Hành động:\n> Làm gì đó dirty với tao");
          break;

        case "fight":
          return interaction.reply({
            content: "⚡ Hành động:\n> Làm tí đường quyền xem nào\n\nHả?..um..Ok?",
            files: ["https://i.wahup.com/media/tmp_meme_images/85cd99b5-e0a5-403a-aff8-f056d6f04b0d.png"],
          });

        case "bigass":
          return interaction.reply({
            content: "⚡ Hành động:\n> Give me a pic of your big ass",
            files: ["https://furrycdn.org/img/2023/5/4/240212/large.png"],
          });

        case "renameLHuy":
          const lhuy = await interaction.guild.members.fetch("813707010129920040");
          if (await safeNick(lhuy, "KhiemMocCu"))
            return interaction.reply("⚡ Hành động:\n> Đổi tên LHuy thành KhiemMocCu");
          break;

        case "sunguyen":
          return interaction.reply({
            content: "⚡ Hành động:\n> Cho t một tấm ảnh của Sử Ngu yên",
            files: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8FYaZxZAE1l_lQShMVI2G33j-jYuIQTs0vg&s"],
          });

        case "vubao":
          return interaction.reply({
            content: "⚡ Hành động:\n> Cho t một tấm ảnh của Vũ Bảo",
            files: ["https://media.tenor.com/6ywOzKRf_IwAAAAM/patrick-star.gif"],
          });

        case "nhay":
          return interaction.reply({
            content: "⚡ Hành động:\n> Nhảy đi\n\nHả?..um..Ok?",
            files: ["https://media.tenor.com/4HkLW40pwKgAAAAm/patrick-patrick-star.webp"],
          });
      }
    }

    /* QUESTION HANDLE */

    if (interaction.customId === "question_menu") {

      const member = interaction.member;
      const selected = interaction.values[0];

      switch (selected) {

        case "gay":
          try { await member.setNickname("TAO BỊ GAY"); }
          catch { return interaction.reply("Định đổi tên mày nhưng mày đẳng cấp quá 🥱"); }

          return interaction.reply("❓ Câu hỏi:\n> Mày bị gay à?\n\nXem lại tên m xem ai mới là thằng gay 😏");

        case "aigay":
          return interaction.reply(`❓ Câu hỏi:\n> Ai gay nhất sever?\n\n${member.user.username} 😏`);

        case "depzai":
          return interaction.reply("❓ Câu hỏi:\n> Ai đẹp zai nhất sever?\n\nTao, thích ý kiến ko? 😎");

        case "luat":
          return interaction.reply("❓ Câu hỏi:\n> Luật Sever\n\nỔ Quỷ thì làm đéo j có luật 😏");

        case "log":
          return interaction.reply("❓ Câu hỏi:\n> Quy tắc Logarit của 1 tích là gì\n\nlog_α (ab) = log_αb + log_αc ...");

        case "alo":
          return interaction.reply({
            content: "❓ Câu hỏi:\n> Alo, Vũ à Vũ?\n\nNhầm số r anh ơi",
            files: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-MoxNym0w9EwK8DZZFkzgYlcm1iVyrE7A-A&s"],
          });

        case "love":
          return interaction.reply("❓ Câu hỏi:\n> M có yêu t ko\n\nDuy Anh yêu tất cả mọi người <3");
      }
    }
  }
});

client.login(process.env.TOKEN);
