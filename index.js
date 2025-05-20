const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.cookwell.com/recipe/grilled-chicken-flatbread';

async function fetchData() {
    try{
        const response = await axios.get(url);
        const data = response.data;
        const $ = cheerio.load(data);
        const recipeTitle = $('h1').text();
        const recipeDescription = $('h2').text();
        const recipe = {
            title: recipeTitle,
            description: recipeDescription,
        };
        console.log('Recipe Title:', recipe.title);
        console.log('Recipe Description:', recipe.description);
        return recipe;
    }
    catch (error){
        console.error('Error fetching data:', error);
    }
}

fetchData();
