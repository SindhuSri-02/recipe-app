import {elements} from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
  elements.searchInput.value = '';  
};

export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPage.innerHTML ='';
};

export const highlightSelector = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    })
    document.querySelector(`.results__link[href*="#${id}"]`).classList.add('results__link--active');//no dot in adding classname
};

//add cmnt from final
/*
// 'Pasta with tomato and spinach'
acc: 0 / acc + cur.length = 5 / newTitle = ['Pasta']
acc: 5 / acc + cur.length = 9 / newTitle = ['Pasta', 'with']
acc: 9 / acc + cur.length = 15 / newTitle = ['Pasta', 'with', 'tomato']
acc: 15 / acc + cur.length = 18 / newTitle = ['Pasta', 'with', 'tomato']
acc: 18 / acc + cur.length = 24 / newTitle = ['Pasta', 'with', 'tomato']
*/
export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);

        // return the result
        return `${newTitle.join(' ')} ...`;
    }
    return title;
}


const renderRecipe = recipe => {
    
    const recipeStr =  `<li>
                        <a class="results__link" href="#${recipe.recipe_id}">
                            <figure class="results__fig">
                                <img src="${recipe.image_url}" alt="Test">
                            </figure>
                            <div class="results__data">
                                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                                <p class="results__author">${recipe.publisher}</p>
                            </div>
                        </a>
                    </li>`;
    
    elements.searchResList.insertAdjacentHTML('beforeend', recipeStr);  //${recipe.image_url}
};

//type: prev or nxt
const createButton = (page, type) => `
                <button class="btn-inline results__btn--${type}" data-goto="${type === 'prev'? page-1 : page+1}">
                    <span>Page ${type === 'prev'? page-1 : page+1}</span>
                    <svg class="search__icon">
                        <use href="img/icons.svg#icon-triangle-${type === 'prev'? 'left' : 'right'}"></use>
                    </svg>
                </button>`;

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage); //no of pages to display
    
    let button;
    
    if (page === 1 && pages > 1) {
        
        //must have single button to next page
        button = createButton(page, 'next');
        
    }else if (page === pages && pages > 1) {
        
        //must have single button to previous page
        button = createButton(page, 'prev');
        
    } else if (page < pages) {
        
        // both next and prev buttons
        button = `${createButton(page, 'prev')}${createButton(page, 'next')}`;
        
    }
    
    elements.searchResPage.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    
    //rendre results of currnt page
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;
    
    //recipes.forEach(renderRecipe);
    recipes.slice(start, end).forEach(renderRecipe); //end is considersed as end -1 in slice
    
    //rendre pagination buttons
    renderButtons(page, recipes.length, resPerPage);
    
};










/*export default class view {
    
    returnView() {
        
        document.querySelector('.search').addEventListener('submit', e => {
            this.query = document.querySelector('search__field').innerHTML;
        });
        
    }
}*///mistake