import axios from 'axios';

const STEAM_API_URL = 'https://store.steampowered.com/api/featuredcategories/';
const GAME_DETAILS_URL =
    'https://store.steampowered.com/api/appdetails?appids=';

async function getGameDetails(appid) {
    try {
        console.log('appid:', appid);
        const response = await axios.get(
            `${GAME_DETAILS_URL}${appid}&currency=18`
        );
        const gameData = response.data[appid];
        console.log('gameData:', gameData);
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

async function getSteam(discount = 100) {
    console.log('discount', discount);
    if (discount === null) discount = 100;
    try {
        const response = await axios.get(STEAM_API_URL, {
            params: {
                cc: 'UA', // Set the country code to Ukraine
            },
        });
        const data = response.data;

        const freeGames = data.specials.items.filter(
            (game) => game.discount_percent >= discount
        );

        // Fetch additional details for each game
        if (freeGames.length > 0) {
            return await Promise.all(
                freeGames.map(async (game) => {
                    console.log('game:', game);
                    const gameDetails = await getGameDetails(game.id);
                    let gameString = /*html*/ `${decodeURIComponent(
                        '%F0%9F%93%BA'
                    )} <b>Platform:</b> Steam Store\n\n${decodeURIComponent(
                        '%F0%9F%8E%AE'
                    )} <b>Game:</b> <a href="https://store.steampowered.com/app/${
                        game.id
                    }/">${gameDetails?.name || game.name}</a>`;

                    if (
                        gameDetails &&
                        gameDetails.price_overview &&
                        (gameDetails.price_overview.initial_formatted ||
                            gameDetails.price_overview.final_formatted)
                    ) {
                        gameString = /*html*/ `${gameString}\n\n${decodeURIComponent(
                            '%E2%9C%85'
                        )} <b>Price:</b> <s>${
                            gameDetails.price_overview.initial_formatted || ''
                        }</s> ${
                            gameDetails.price_overview.final_formatted || ''
                        }`;
                        if (gameDetails.price_overview.discount_percent) {
                            gameString = /*html*/ `${gameString}\n\n${decodeURIComponent(
                                '%F0%9F%8F%B7%EF%B8%8F'
                            )} <b>Discount:</b> ${
                                gameDetails.price_overview.discount_percent
                            }%`;
                        }
                    }

                    if (gameDetails && gameDetails.short_description) {
                        gameString = /*html*/ `${gameString}\n\n ${decodeURIComponent(
                            '%F0%9F%92%AC'
                        )} <b>Description:</b> ${
                            gameDetails.short_description
                        }`;
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
