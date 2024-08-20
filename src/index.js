import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import getEpicGames from './services/epicGames.js'
import getSteam from './services/steam.js'

const token = process.env.TELEGRAM_BOT_TOKEN;
const STEAM_API_KEY = process.env.STEAM_API_KEY;
console.log('STEAM_API_KEY:', STEAM_API_KEY)
const bot = new TelegramBot(token, { polling: true });

async function getFreeGames() {
  const epicGames = getEpicGames();
  console.log('epicGames',epicGames);
  const steam = getSteam();
  
  return epicGames;
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  bot.sendMessage(chatId, "<a href='https://www.google.com/'>Google</a>", { parse_mode: 'HTML' });

  if (messageText === '/start') {
    bot.sendMessage(chatId, 'Welcome to the bot!');
  } else if (messageText === '/freegames') {
    const freeGamesList = await getFreeGames();
    console.log('freeGamesList',freeGamesList);
    
    bot.sendMessage(chatId, freeGamesList, { parse_mode: 'HTML' });
  } else {
    bot.sendMessage(chatId, 'New message!!!');
  }
});
