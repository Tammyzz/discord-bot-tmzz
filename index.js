const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot đang sống 😎');
});

app.listen(3000, () => {
  console.log('Web server đang chạy');
});

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`Bot đã online: ${client.user.tag}`);
});

client.login(process.env.TOKEN);
