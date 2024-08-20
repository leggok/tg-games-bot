import axios from 'axios';

async function getSteam() {
    try {
      const url = 'https://store.steampowered.com/api/featuredcategories/?cc=us';
  
      const response = await axios.get(url);
      const data = response.data;
  
      const freeGames = data.specials.items.filter(game => game.final_price === 0);
  
    //   freeGames.forEach(game => {
    //     console.log(`steam Title: ${game.name}`);
    //     console.log(`URL: https://store.steampowered.com/app/${game.id}`);
    //     console.log('---');
    //   });
      return freeGames;
    } catch (error) {
      console.error('Error fetching free games:', error);
      return 'Failed to fetch free games. Please try again later.';
    }
}

export default getSteam;