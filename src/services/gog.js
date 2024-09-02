import axios from 'axios';
import * as cheerio from 'cheerio';

async function getGOG(discount = null) {
    try {
        // const { data } = await axios.get('https://www.gog.com/games?price=free&sort=popularity');
        const { data } = await axios.get(
            'https://www.gog.com/en/games?priceRange=0,69',
            {
                params: {
                    discounted: 'true', // Set the country code to Ukraine
                },
            }
        );
        const $ = cheerio.load(data);

        const games = [];

        $('.product-tile').each((index, element) => {
            const title = $(element)
                .find('.product-tile__title')
                .attr('title')
                .trim();
            const url = $(element).attr('href');

            games.push({ title, url });
        });

        for (let game of games) {
            try {
                console.log('url', game.url);

                const { data } = await axios.get(game.url);

                const $ = cheerio.load(data);

                game.description = $('.layout-main-col .description')
                    .text()
                    .trim();
                console.log('description', game.description);
            } catch (error) {
                console.log('error', error);
                game.description = false;
            }
        }

        console.log('games', games);

        return games.map((game) => {
            let gameString = /*html*/ `<b>GOG Store</b>\n\n<a href="${game.url}">${game.title}</a>`;
            if (game.description && game.description.length > 0) {
                gameString = `${gameString}\n\n${game.description}`;
            }
            return gameString;
        });
    } catch (error) {
        console.error('Error fetching games:', error);
    }
}

export default getGOG;
