import axios from 'axios';
import uniqid from 'uniqid';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }
    
    async getRecipe() {
        
        const proxy = 'https://cors-anywhere.herokuapp.com/';
        
        try {
            
            const res = await axios(`${proxy}https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            //console.log(res);
        } catch (error) {
            console.log(error);
            alert('something went wrong');
        }
    }
    
    calcTime() {
        const numIng = this.ingredients.length;
        const perEachIng = Math.ceil(numIng / 3);
        this.time = perEachIng * 15;//assuming 15 min for each 3 ings
    }
    
    calcServings() {
        this.servings = 4;
    }
    
    parseIngredients() {
        
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];
        
        const newIngredients = this.ingredients.map(el => {
            
            //1) uniform ingredients
            let ingredient = el.toLowerCase();
            
            unitsLong.forEach((unit,i) => {
               ingredient = ingredient.replace(unit, unitsShort[i]); 
            });
            
            //2) remove ()
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
            
            //3) parse ingredients into count, unit and ingredients
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
            
            let objIng;
            
            if(unitIndex > -1) {
                //there is unit
                //4 1/2 cups then arrCount = [4, 1/2]
                //4 cups then arrCount = [4]
                const arrCount = arrIng.slice(0, unitIndex);
                
                let count;
                if(arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0,unitIndex).join('+'));
                }
                
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex+1).join(' '),
                    ingid: uniqid()
                }
                
            } else if (unitIndex === -1) {
                //no unit and no num at first ele
                
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient,
                    ingid: uniqid()
                }
                
            } else if (parseInt(arrIng[0], 10)) {
                //no unit but first ele is int
                
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' '),
                    ingid: uniqid()
                }
                
            }
            
            return objIng;
            
        });
        this.ingredients = newIngredients;
    }
    
    updateServings (type) {
        //sreving
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
        
        //ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });
        
        
        this.servings = newServings;
    }
}






















