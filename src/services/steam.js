import axios from 'axios';

async function getSteam() {
    try {
      const url = 'https://store.steampowered.com/api/featuredcategories/?cc=us';
  
      const response = await axios.get(url);
      const data = response.data;
  
      const freeGames = data.specials.items.filter(game => game.final_price === 599);
      const preparedGames = freeGames.map(game => `<a href="https://store.steampowered.com/app/${game.id}/"> ${game.name}</a>`);
  
      return preparedGames;
    } catch (error) {
      console.error('Error fetching free games:', error);
      return 'Failed to fetch free games. Please try again later.';
    }
}

export default getSteam;