import axios from 'axios';

const STEAM_API_URL =
    'https://store.steampowered.com/api/featuredcategories/?cc=uk';
const GAME_DETAILS_URL =
    'https://store.steampowered.com/api/appdetails?appids=';

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

        const freeGames = data.specials.items.filter(
            (game) => game.discount_percent > 80
        );

        // Fetch additional details for each game
        if (freeGames.length > 0) {
            return await Promise.all(
                freeGames.map(async (game) => {
                    const gameDetails = await getGameDetails(game.id);
                    let gameString = `Steam Store\n\n<a href="https://store.steampowered.com/app/${
                        game.id
                    }/">${gameDetails?.name || game.name}</a>`;

                    if (gameDetails && gameDetails.short_description) {
                        gameString = `${gameString}\n\n${gameDetails.short_description}`;
                    }

                    return gameString;
                })
            );
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching free games:', error);
        return 'Failed to fetch free games. Please try again later.';
    }
}

export default getSteam;
