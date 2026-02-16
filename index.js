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
    console.log("Đăng ký lệnh thành công!");
  } catch (err) {
    console.error(err);
  }
})();

// ===== HANDLE INTERACTION =====
client.on(Events.InteractionCreate, async interaction => {

  if (interaction.isChatInputCommand() && interaction.commandName === "36") {

    const menu = new StringSelectMenuBuilder()
      .setCustomId("menu_36")
      .setPlaceholder("Muốn gì vậy cu eim?")
      .addOptions([
        { label: "Luật Sever", value: "luat" },
        { label: "Mày bị gay à?", value: "gay" },
        { label: "Send n#de for me plz?", value: "cute" },
        { label: "Ai gay nhất sever?", value: "aigay" },
        { label: "Ai đẹp zai nhất sever?", value: "depzai" },
        { label: "khinh mấy thằng 36", value: "khinh" },
        { label: "Alo, Vũ à Vũ?", value: "vu" },
        { label: "Chỉ t cách rap battle đi cu", value: "rap" },
        { label: "Cho t xem bộ mặt thật của Vũ bảo", value: "vu2" },
        { label: "Cho t xem bộ mặt thật của Sử Nguy ên", value: "su" },
        { label: "Bật Album Nổ của Wren Evans", value: "wren" },
        { label: "Tao yêu mày", value: "love" },
        { label: "Recomment game hay", value: "game" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: "Muốn gì vậy cu eim?",
      components: [row]
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === "menu_36") {

    const choice = interaction.values[0];
    const username = interaction.user.username;

    const selected = interaction.component.options.find(
      o => o.value === choice
    );

    let reply = "";

    switch (choice) {

      case "luat":
        reply = "Ổ Quỷ thì làm đéo j có luật 😏";
        break;

      case "gay":
        try {
          const member = interaction.member;

          if (!member.manageable) {
            reply = "Tao đụng không tới mày rồi 😭";
            break;
          }

          await member.setNickname("Chó Gay 😏");
          reply = "Xem lại nickname m xem 😏";
        } catch (err) {
          console.error(err);
          reply = "Lỗi mẹ gì đó rồi 💀";
        }
        break;

      case "cute":
        reply = "😈 https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Who_is_the_Cutest%3F.jpg/500px-Who_is_the_Cutest%3F.jpg";
        break;

      case "aigay":
        reply = "Tao…";
        break;

      case "depzai":
        reply = `Chắc là… ${username} 😉`;
        break;

      case "khinh":
        reply = "Ê.. 🤨";
        break;

      case "vu":
        reply = "Vũ cái l#n má mày";
        break;

      case "rap":
        reply = "Đây đây chỉ cho… Cái địt con mẹ m con chó Thiên Tâm t đéo làm gì m nha...";
        break;

      case "vu2":
        reply = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhJookOmhxlnp10GhpSrdRW21Xi7VoKzH9-A&s";
        break;

      case "su":
        reply = "https://palada.vn/wp-content/uploads/2023/10/an-ba-to-com.jpg";
        break;

      case "wren":
        reply = "Suc vat ngoại tình, Ewww 😨";
        break;

      case "love":
        reply = "Tao cũng vậy <3";
        break;

      case "game":
        reply = "https://store.steampowered.com/app/3855540/BLACK_SOULS_II/";
        break;
    }

    // TẠO LẠI MENU ĐỂ MỞ TIẾP
    const newMenu = new StringSelectMenuBuilder()
      .setCustomId("menu_36")
      .setPlaceholder("Muốn hỏi tiếp không?")
      .addOptions(interaction.component.options);

    const newRow = new ActionRowBuilder().addComponents(newMenu);

    await interaction.update({
      content: `**Đã trả lời câu hỏi của bạn:** ${selected.label}\n\n${reply}`,
      components: [newRow]
    });
  }
});

client.login(process.env.TOKEN);

