import axios from 'axios';

async function getEpicGames() {
    try {
        const response = await axios.get(`https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=uk-UA&country=UA&allowCountries=UA`);
        const data = response.data;
    
        const freeGames = data.data.Catalog.searchStore.elements.filter(game => {
			return game.promotions && game.promotions.promotionalOffers.length > 0;
        });
        
        return freeGames.map(game => {
			let gameString = /*html*/`<b>EpicGames Store</b>\n\n<a href="https://store.epicgames.com/en-US/p/${game.offerMappings[0].pageSlug}/">${game.title}</a>`
			if (game.description.length > 0) {
				return `${gameString}\n\n${game.description}`;
			}
			return gameString
		})
      } catch (error) {
        console.error('Error fetching free games:', error);
        return 'Failed to fetch free games. Please try again later.';
      }
}

export default getEpicGames;