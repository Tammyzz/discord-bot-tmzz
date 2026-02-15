const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot đang sống 😎');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Web server đang chạy');
});

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

client.once('ready', () => {
  console.log(`Bot đã online: ${client.user.tag}`);
});

client.on('error', console.error);
console.log("TOKEN =", process.env.TOKEN);
client.login(process.env.TOKEN)
  .then(() => console.log("Đang login vào Discord..."))
  .catch(err => console.error("Lỗi login:", err));
