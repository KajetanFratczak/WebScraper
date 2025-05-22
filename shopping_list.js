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

        let shoppingListText = 'Lista zakupów:\n\n';

        selectedRecipes.forEach(recipe => {
            shoppingListText += `Przepis: ${recipe.title}\n`;
            shoppingListText += `Składniki:\n`;
            recipe.ingredients.forEach(group => {
                group.forEach(ingredient => {
                    const amount = ingredient.amount ? `${ingredient.amount} ` : '';
                    shoppingListText += `- ${amount}${ingredient.name}\n`;
                });
            });

            shoppingListText += '\nInstrukcje:\n';
            recipe.instructions.forEach((instruction, index) => {
                shoppingListText += `${index + 1}: ${instruction}\n`;
            });

            shoppingListText += '\n';
        });


        const ingredientsMap = new Map();
        selectedRecipes.forEach(recipe => {
            recipe.ingredients.forEach(group => {
                group.forEach(ingredient => {
                    const key = ingredient.name.trim().toLowerCase();
                    const amount = ingredient.amount ? `${ingredient.amount} ` : '';
                    if (ingredientsMap.has(key)) {
                        const existingAmounts = ingredientsMap.get(key);

                        ingredientsMap.set(key, existingAmounts + ', ' + amount);
                    } else {
                        ingredientsMap.set(key, amount);
                    }
                });
            });
        });

        shoppingListText += 'Podsumowanie:\n';
        ingredientsMap.forEach((amount, ingredient) => {
            shoppingListText += `- ${amount}${ingredient}\n`;
        });

        console.log(shoppingListText);

        rl.close();
    });
    
    
}

generateShoppingList();