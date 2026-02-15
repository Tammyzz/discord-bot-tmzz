const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot đang sống 😎');
});

app.listen(process.env.PORT, () => {
  console.log('Web server đang chạy');
});

const { Client, GatewayIntentBits } = require('discord.js');

console.log("Bắt đầu tạo client...");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.on("ready", () => {
  console.log("ĐÃ CONNECT DISCORD:", client.user.tag);
});

client.on("error", (err) => {
  console.error("Client error:", err);
});

client.on("shardError", (err) => {
  console.error("Shard error:", err);
});

console.log("Đang login...");

client.login(process.env.TOKEN)
  .then(() => console.log("Login promise resolved"))
  .catch((err) => console.error("Login failed:", err));
