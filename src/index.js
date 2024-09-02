import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import getEpicGames from './services/epicGames.js';
import getSteam from './services/steam.js';
import getGOG from './services/gog.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// In-memory store for user sessions
const userSessions = {};

// Function to get free games from specified platforms
async function getFreeGames(platform, discount = null) {
    const gamesFetchers = {
        epicgames: getEpicGames,
        steam: getSteam,
        gog: getGOG,
    };

    const selectedPlatforms =
        platform === 'all' ? Object.keys(gamesFetchers) : [platform];
    const gamesList = await Promise.all(
        selectedPlatforms.map(async (p) => gamesFetchers[p](discount))
    );

    return gamesList.flat().filter((game) => game);
}

// Function to send the games list to the user
async function sendGames(platform, chatId, discount = null) {
    const gamesList = await getFreeGames(platform, discount);

    if (gamesList.length > 0) {
        for (let game of gamesList) {
            await bot.sendMessage(chatId, game, { parse_mode: 'HTML' });
        }
    } else {
        await bot.sendMessage(
            chatId,
            'No free games available at the moment.',
            { parse_mode: 'HTML' }
        );
    }
}

// Function to handle the start command
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'You need games?', {
        reply_markup: {
            keyboard: [['With discount'], ['Totally free'], ['Step Back']],
        },
    });
});

// Function to handle incoming messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text.toLowerCase();

    // Initialize user session if not exists
    if (!userSessions[chatId]) {
        userSessions[chatId] = {};
    }

    if (messageText.includes('totally free')) {
        userSessions[chatId].state = 'select_platform'; // Track state
        await bot.sendMessage(chatId, 'Choose a platform:', {
            reply_markup: {
                keyboard: [
                    ['Steam', 'Epic Games', 'GOG'],
                    ['All'],
                    ['Step Back'],
                ],
            },
        });
    } else if (messageText.includes('with discount')) {
        userSessions[chatId].state = 'select_discount'; // Track state
        await bot.sendMessage(chatId, 'Discount should be more than:', {
            reply_markup: {
                keyboard: [
                    ['40%', '50%', '75%', '90%'],
                    ['Any'],
                    ['Step Back'],
                ],
            },
        });
    } else if (userSessions[chatId].state === 'select_discount') {
        if (messageText.includes('step back')) {
            userSessions[chatId].state = 'initial'; // Go back to initial state
            await bot.sendMessage(chatId, 'You need games?', {
                reply_markup: {
                    keyboard: [
                        ['With discount'],
                        ['Totally free'],
                        ['Step Back'],
                    ],
                },
            });
        } else {
            userSessions[chatId].discount = messageText; // Store discount choice
            userSessions[chatId].state = 'select_platform'; // Set state to platform selection
            await bot.sendMessage(chatId, 'Choose a platform:', {
                reply_markup: {
                    keyboard: [
                        ['Steam', 'Epic Games', 'GOG'],
                        ['All'],
                        ['Step Back'],
                    ],
                },
            });
        }
    } else if (userSessions[chatId].state === 'select_platform') {
        if (messageText.includes('step back')) {
            userSessions[chatId].state = 'select_discount'; // Go back to discount selection
            await bot.sendMessage(chatId, 'Discount should be more than:', {
                reply_markup: {
                    keyboard: [
                        ['40%', '50%', '75%', '90%'],
                        ['Any'],
                        ['Step Back'],
                    ],
                },
            });
        } else {
            const platform = messageText.replace(' ', '').toLowerCase();
            const discount =
                Number(userSessions[chatId].discount?.replaceAll('%', '')) ||
                100; // Retrieve discount choice
            await sendGames(platform, chatId, discount);
            userSessions[chatId] = {}; // Clear session after processing
        }
    } else if (messageText.includes('step back')) {
        // Handle "Step Back" from initial state or other contexts
        if (userSessions[chatId].state === 'initial') {
            await bot.sendMessage(chatId, 'You need games?', {
                reply_markup: {
                    keyboard: [
                        ['With discount'],
                        ['Totally free'],
                        ['Step Back'],
                    ],
                },
            });
        } else {
            userSessions[chatId].state = 'initial'; // Go back to initial state
            await bot.sendMessage(chatId, 'You need games?', {
                reply_markup: {
                    keyboard: [
                        ['With discount'],
                        ['Totally free'],
                        ['Step Back'],
                    ],
                },
            });
        }
    }
});
