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
            keyboard: [['Choose Platform']],
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

    if (messageText === 'choose platform') {
        userSessions[chatId].state = 'select_platform'; // Track state
        await bot.sendMessage(chatId, 'Choose a platform:', {
            reply_markup: {
                keyboard: [['Steam', 'Epic Games', 'GOG'], ['Step Back']],
            },
        });
    } else if (userSessions[chatId].state === 'select_platform') {
        if (messageText.includes('step back')) {
            userSessions[chatId].state = 'initial'; // Go back to initial state
            await bot.sendMessage(chatId, 'You need games?', {
                reply_markup: {
                    keyboard: [['Choose Platform']],
                },
            });
        } else {
            const platform = messageText.replace(' ', '').toLowerCase();
            userSessions[chatId].platform = platform; // Store selected platform
            userSessions[chatId].state = 'select_filter'; // Set state to filter selection
            await bot.sendMessage(chatId, 'Choose a filter:', {
                reply_markup: {
                    keyboard: [['Free', 'With Discount'], ['Step Back']],
                },
            });
        }
    } else if (userSessions[chatId].state === 'select_filter') {
        if (messageText.includes('step back')) {
            userSessions[chatId].state = 'select_platform'; // Go back to platform selection
            await bot.sendMessage(chatId, 'Choose a platform:', {
                reply_markup: {
                    keyboard: [['Steam', 'Epic Games', 'GOG'], ['Step Back']],
                },
            });
        } else if (messageText === 'free') {
            const platform = userSessions[chatId].platform;
            await sendGames(platform, chatId);
            userSessions[chatId] = {}; // Clear session after processing
        } else if (messageText === 'with discount') {
            userSessions[chatId].state = 'select_discount'; // Set state to discount selection
            const platform = userSessions[chatId].platform;
            const discountOptions =
                platform === 'gog'
                    ? ['Max Price']
                    : ['40%', '50%', '75%', '90%'];
            await bot.sendMessage(chatId, `Choose discount for ${platform}:`, {
                reply_markup: {
                    keyboard: [
                        ...discountOptions.map((option) => [option]),
                        ['Step Back'],
                    ],
                },
            });
        }
    } else if (userSessions[chatId].state === 'select_discount') {
        if (messageText.includes('step back')) {
            userSessions[chatId].state = 'select_filter'; // Go back to filter selection
            await bot.sendMessage(chatId, 'Choose a filter:', {
                reply_markup: {
                    keyboard: [['Free', 'With Discount'], ['Step Back']],
                },
            });
        } else {
            const platform = userSessions[chatId].platform;
            if (platform === 'gog' && messageText === 'max price') {
                userSessions[chatId].discount = null; // Max price will be typed
                await bot.sendMessage(chatId, 'Enter the maximum price in $:', {
                    reply_markup: {
                        keyboard: [['Step Back']],
                    },
                });
            } else {
                userSessions[chatId].discount = messageText.replace('%', ''); // Store discount choice
                const discount = Number(userSessions[chatId].discount) || null;
                await sendGames(platform, chatId, discount);
                userSessions[chatId] = {}; // Clear session after processing
            }
        }
    } else if (
        messageText.match(/^\d+$/) &&
        userSessions[chatId].state === 'select_discount'
    ) {
        // Handle max price for GOG
        const platform = userSessions[chatId].platform;
        const maxPrice = parseInt(messageText, 10);
        await sendGames(platform, chatId, maxPrice);
        userSessions[chatId] = {}; // Clear session after processing
    } else if (messageText.includes('step back')) {
        if (userSessions[chatId].state === 'initial') {
            await bot.sendMessage(chatId, 'You need games?', {
                reply_markup: {
                    keyboard: [['Choose Platform']],
                },
            });
        } else if (userSessions[chatId].state === 'select_platform') {
            await bot.sendMessage(chatId, 'You need games?', {
                reply_markup: {
                    keyboard: [['Choose Platform']],
                },
            });
        } else {
            userSessions[chatId].state = 'initial'; // Go back to initial state
            await bot.sendMessage(chatId, 'You need games?', {
                reply_markup: {
                    keyboard: [['Choose Platform']],
                },
            });
        }
    }
});
