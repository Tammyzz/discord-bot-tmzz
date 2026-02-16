const { 
  Client, 
  GatewayIntentBits, 
  SlashCommandBuilder, 
  REST, 
  Routes, 
  EmbedBuilder 
} = require("discord.js");

const { 
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState
} = require("@discordjs/voice");

const play = require("play-dl");

const TOKEN = "BOT_TOKEN_CỦA_M";
const CLIENT_ID = "CLIENT_ID_CỦA_M";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

let connection;
let player = createAudioPlayer();

const commands = [
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Phát nhạc từ YouTube")
    .addStringOption(option =>
      option.setName("link")
        .setDescription("Link YouTube")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Dừng nhạc"),

  new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Bỏ qua bài hiện tại"),

  new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Thoát voice"),

  new SlashCommandBuilder()
    .setName("hoi")
    .setDescription("Bot trả lời câu hỏi mẫu")
    .addStringOption(option =>
      option.setName("cauhoi")
        .setDescription("Nhập câu hỏi")
        .setRequired(true)
    )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log("Slash command đã đăng ký");
  } catch (err) {
    console.error(err);
  }
})();

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // ================= PLAY =================
  if (interaction.commandName === "play") {

    const url = interaction.options.getString("link");
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel)
      return interaction.reply("Vào voice đi rồi gọi tao 🙂");

    await interaction.reply("Đang tải nhạc...");

    try {

      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 20000);

      const stream = await play.stream(url);

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Playing, () => {
        interaction.followUp("🎵 Đang phát rồi nè");
      });

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

    } catch (err) {
      console.error(err);
      interaction.followUp("Lỗi rồi 🙂");
      if (connection) connection.destroy();
    }
  }

  // ================= STOP =================
  if (interaction.commandName === "stop") {
    if (!connection) return interaction.reply("Tao chưa vào voice mà 🙂");
    player.stop();
    connection.destroy();
    interaction.reply("Đã dừng nhạc");
  }

  // ================= SKIP =================
  if (interaction.commandName === "skip") {
    player.stop();
    interaction.reply("⏭ Đã skip");
  }

  // ================= LEAVE =================
  if (interaction.commandName === "leave") {
    if (connection) {
      connection.destroy();
      interaction.reply("👋 Tao out đây");
    } else {
      interaction.reply("Tao chưa vào voice 🙂");
    }
  }

  // ================= HỎI ĐÁP =================
  if (interaction.commandName === "hoi") {

    const question = interaction.options.getString("cauhoi");

    const embed = new EmbedBuilder()
      .setDescription(`❓ : ${question}\n\n👉 Trả lời: Tao chưa biết đâu 🙂`)
      .setImage("https://i.imgur.com/3ZUrjUP.jpeg")
      .setColor(0xFF66CC);

    interaction.reply({ embeds: [embed] });
  }

});

client.once("ready", () => {
  console.log("Bot đã online");
});

client.login(TOKEN);
