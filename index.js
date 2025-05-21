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
            ingredients: [],
            instructions: []
        };

        $('div.container.grid-cols-2.lg\\:grid div.rounded-4\\/3em ul li[data-testid="ingredient-group"]').each((index, group) => {            
            const groupIngredients = [];

            $(group).find('li').each((index, element) => {
                const name = $(element).find('div.flex-grow div.flex-row span').first().text();
                const amount = $(element).find('div.flex-col span.font-sans-medium').first().text();
                const notes = $(element).find('div.flex-col span.text-xs').text();

                const ingredient = {
                    name: name,
                    amount: amount,
                    notes: notes
                };
                groupIngredients.push(ingredient);
            });
            recipe.ingredients.push(groupIngredients);  
        });

        $('div.container.grid-cols-2.lg\\:grid section.prose.flex-col h4.text-heading-4').each((index, element) => {
            const instruction = $(element).text().trim();
            if (instruction.startsWith('Step')) {
                const details = $(element).next('div.prose').text().trim().replace(/\n/g, ' ');
                recipe.instructions.push(`${instruction}: ${details}`);
            }
        });

        console.log('Recipe Title:', recipe.title);
        console.log('Recipe Description:', recipe.description);
        console.log('Ingredients:', recipe.ingredients);
        console.log('Instructions:', recipe.instructions);
        return recipe;
    }
    catch (error){
        console.error('Error fetching data:', error);
    }
}

fetchData();
