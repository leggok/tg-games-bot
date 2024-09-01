import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import getEpicGames from './services/epicGames.js';
import getSteam from './services/steam.js';
import getGOG from './services/gog.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const STEAM_API_KEY = process.env.STEAM_API_KEY;
console.log('STEAM_API_KEY:', STEAM_API_KEY);
const bot = new TelegramBot(token, { polling: true });

async function getFreeGames(platform) {
    const completeList = [];

    if (platform === 'epicgames' || platform === 'all') {
        const epicGames = await getEpicGames();
        if (epicGames.length > 0) {
            completeList.push(...epicGames);
        }
    }

    if (platform === 'steam' || platform === 'all') {
        const steam = await getSteam();
        if (steam.length > 0) {
            completeList.push(...steam);
        }
    }

    if (platform === 'gog' || platform === 'all') {
        const gog = await getGOG();
        if (gog.length > 0) {
            completeList.push(...gog);
        }
    }
    return completeList;
}

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Choose platform', {
        reply_markup: {
            keyboard: [['Steam', 'Epic Games', 'GOG'], ['All'], ['Close']],
        },
    });
});

async function getGames(platform = null, chatId) {
    const freeGamesList = await getFreeGames(platform);

    if (freeGamesList.length > 0) {
        freeGamesList.forEach((game) => {
            console.log('game', game);

            if (game) {
                bot.sendMessage(chatId, game, { parse_mode: 'HTML' });
            }
        });
    } else {
        bot.sendMessage(chatId, 'No free games', { parse_mode: 'HTML' });
    }
}

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // Send the text message with a hyperlink
    //   bot.sendPhoto(chatId, "https://ethicalads.blob.core.windows.net/media/images/2020/01/readthedocs-logo-fs8_k6Ps9wN.png", {
    //     caption: "Check out Google: https://www.google.com/"
    // });
    await getGames(messageText.toLowerCase().replaceAll(' ', ''), chatId);
});
