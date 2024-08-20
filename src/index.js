import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import getEpicGames from './services/epicGames.js'
import getSteam from './services/steam.js'
import getGOG from './services/gog.js'

const token = process.env.TELEGRAM_BOT_TOKEN;
const STEAM_API_KEY = process.env.STEAM_API_KEY;
console.log('STEAM_API_KEY:', STEAM_API_KEY)
const bot = new TelegramBot(token, { polling: true });

async function getFreeGames() {
	const completeList = [];

	const epicGames = await getEpicGames();
	if (epicGames.length > 0) {
		completeList.push(...epicGames)
	}

	const steam = await getSteam();
	if (steam.length > 0) {
		completeList.push(...steam)
	}

	const gog = await getGOG();
	if (gog.length > 0) {
		completeList.push(...gog)
	}

	return completeList;
}

bot.on('message', async (msg) => {
	const chatId = msg.chat.id;
	const messageText = msg.text;

	// Send the text message with a hyperlink
	//   bot.sendPhoto(chatId, "https://ethicalads.blob.core.windows.net/media/images/2020/01/readthedocs-logo-fs8_k6Ps9wN.png", {
	//     caption: "Check out Google: https://www.google.com/"
	// });


	if (messageText === '/start') {
		bot.sendMessage(chatId, 'Welcome to the bot!');
	} else if (messageText === '/freegames') {
		const freeGamesList = await getFreeGames();
		console.log('freeGamesList',freeGamesList);
		if (freeGamesList.length > 0) {
			freeGamesList.forEach(game => {
				bot.sendMessage(chatId, game, { parse_mode: 'HTML' });
			});
		} else {
			bot.sendMessage(chatId, 'No free games', { parse_mode: 'HTML' });
		}
	} else {
		bot.sendMessage(chatId, 'New message!!!');
	}
});
