const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const xml2js = require('xml2js');

async function fetchRecipeLinksFromSitemap(sitemapUrl) {
    const response = await axios.get(sitemapUrl);
    const xml = response.data;
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);

    const urls = result.urlset.url.map(url => url.loc[0]);
    const recipeUrls = urls.filter(url => url.includes('/recipe/'));
    return recipeUrls;
}

async function fetchData(url) {
    try{
        const response = await axios.get(url);
        const data = response.data;
        const $ = cheerio.load(data);

        let recipeTitle = $('h1').text();
        recipeTitle = recipeTitle.replace("Free Spice Guide", "");
        const recipeDescription = $('h2').text();
        const recipe = {
            title: recipeTitle,
            description: recipeDescription,
            ingredients: [],
            instructions: [],
            nutrition: {
                calories: null
            }
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

        $('script[type="application/ld+json"]').each((index, element) => {
            const content = $(element).html();
            if (content && content.includes('calories')) {
                const jsonData = JSON.parse(content);
                recipe.nutrition.calories = jsonData.nutrition?.calories 
            }
        });

        console.log('Recipe Title:', recipe.title);
        console.log('Recipe Description:', recipe.description);
        console.log('Ingredients:', recipe.ingredients);
        console.log('Instructions:', recipe.instructions);
        console.log('Nutrition:', recipe.nutrition);

        return recipe;
    }
    catch (error){
        console.error('Error fetching data:', error);
    }
}

async function ultimateScraper() {
    const sitemapUrl = 'https://www.cookwell.com/server-sitemap.xml'; 
    const recipeUrls = await fetchRecipeLinksFromSitemap(sitemapUrl);

    const allRecipes = [];

    for (const url of recipeUrls) {
        console.log('Fetching data from:', url);
        const recipe = await fetchData(url);
        if (recipe) {
            allRecipes.push(recipe);
        }
    }

    fs.writeFileSync('all_recipes.json', JSON.stringify(allRecipes, null, 2), 'utf-8');
    console.log('All recipes saved to all_recipes.json');
}

ultimateScraper();
