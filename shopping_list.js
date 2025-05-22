const fs = require('fs');
const readline = require('readline');

async function generateShoppingList() {
    const recipesData = JSON.parse(fs.readFileSync('all_recipes.json', 'utf8'));
    
    // Show available recipes
    console.log('Dostępne przepisy: ');
    recipesData.forEach((recipe, index) => {
        console.log(`${index + 1}: ${recipe.title}`);
    });

    // Choose recipes for a shopping list
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Podaj numery przepisów oddzielone przecinkami: ', (answer) => {
        console.log('Wybrane przepisy:', answer);
        const selectedRecipeIndices = answer.split(',').map(num => parseInt(num.trim()) - 1);
        const selectedRecipes = selectedRecipeIndices.map(index => recipesData[index]);

        const ingredientsMap = new Map();

        selectedRecipes.forEach(recipe => {
            recipe.ingredients.forEach(group => {
                group.forEach(ingredient => {
                    const key = ingredient.name.trim().toLowerCase();
                    if (!ingredientsMap.has(key)){
                        ingredientsMap.set(key, true);
                        const amount = ingredient.amount?.trim() || '-';
                        shoppingListText += `${ingredient.name}: ${amount}\n`;
                    }
                });
            });
            
        });

        shoppingListText += '\n\n';
        console.log(shoppingListText);

        rl.close();
    });
    
    
}

generateShoppingList();