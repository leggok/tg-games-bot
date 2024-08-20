import axios from 'axios';

async function getEpicGames() {
    try {
        const response = await axios.get(`https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=uk-UA&country=UA&allowCountries=UA`);
        const data = response.data;
    
        const freeGames = data.data.Catalog.searchStore.elements.filter(game => {
          return game.promotions && game.promotions.promotionalOffers.length > 0;
        });
    
        // freeGames.forEach(game => {
        //   console.log(`Title: ${game.title}`);
        //   console.log(`URL: https://www.epicgames.com/store/en-US/p/${game.productSlug}`);
        //   console.log(`Promotion Period: ${game.promotions.promotionalOffers[0].promotionalOffers[0].startDate} to ${game.promotions.promotionalOffers[0].promotionalOffers[0].endDate}`);
        //   console.log('---');
        // });
        console.log('freeGames',freeGames[1].keyImages);
        
        return freeGames.map(game => `<a href="${game.url}">Title: ${game.title}, Price: Free</a>`).join('\n');
      } catch (error) {
        console.error('Error fetching free games:', error);
        return 'Failed to fetch free games. Please try again later.';
      }
}

export default getEpicGames;