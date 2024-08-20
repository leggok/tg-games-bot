import axios from 'axios';

const STEAM_API_URL = 'https://store.steampowered.com/api/featuredcategories/?cc=us';
const GAME_DETAILS_URL = 'https://store.steampowered.com/api/appdetails?appids=';

async function getGameDetails(appid) {
    try {
        const response = await axios.get(`${GAME_DETAILS_URL}${appid}`);
        const gameData = response.data[appid];
        if (gameData.success) {
            return gameData.data;
        } else {
            throw new Error('Failed to fetch game details');
        }
    } catch (error) {
        console.error(`Error fetching details for game ${appid}:`, error);
        return null;
    }
}

async function getSteam() {
    try {
        const response = await axios.get(STEAM_API_URL);
        const data = response.data;
        
        const freeGames = data.specials.items.filter(game => game.final_price === 599);
        
        // Fetch additional details for each game
        const preparedGames = await Promise.all(freeGames.map(async (game) => {
            const gameDetails = await getGameDetails(game.id);
            if (gameDetails) {
                const { name, short_description } = gameDetails;
                return `Steam Store\n\n<a href="https://store.steampowered.com/app/${game.id}/">${name}</a>\n\n${short_description}`;
            } else {
                return `Steam Store\n\n<a href="https://store.steampowered.com/app/${game.id}/">${game.name}</a>`;
            }
        }));

        return preparedGames;
    } catch (error) {
        console.error('Error fetching free games:', error);
        return 'Failed to fetch free games. Please try again later.';
    }
}

export default getSteam;
