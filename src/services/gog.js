import axios from 'axios';
import * as cheerio from 'cheerio';

async function getGOG() {
    try {
        // const { data } = await axios.get('https://www.gog.com/games?price=free&sort=popularity');
        const { data } = await axios.get('https://www.gog.com/en/games?priceRange=0,0&discounted=true');
        const $ = cheerio.load(data);

        const games = [];

        $('.product-tile').each((index, element) => {
            const title = $(element).find('.product-tile__title').attr('title').trim();
            const url = $(element).attr('href');

            games.push({ title, url });
        });

        console.log(games);
        return games.map(game => `<a href="${game.url}"> ${game.title}</a>`);;
    } catch (error) {
        console.error('Error fetching games:', error);
    }
}

export default getGOG;