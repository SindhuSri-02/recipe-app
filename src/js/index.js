//https://forkify-api.herokuapp.com/api/search

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView  from './views/searchView';
import * as recipeView  from './views/recipeView';
import * as listView  from './views/listView';
import * as likesView  from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';

/*
Global stae of the app
-search object
-current recipe obj
-shopping list object
-liked recipes
*/
const state = {};
//window.state = state //testing

/******
**********************************SEARCH CONTROLER
********/

//remember every async func return promise
const controlSearch = async () => {//async is used to use await
    //1)get query from view
    const query = searchView.getInput();//todo later
    //console.log(query);
    
    if(query) {
        //2) new search obj add to state
        state.search = new Search(query);
        
        //3) prepare ui for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        
        //here we can use try and catch
        //4) search for recipes   //await is used because matter must be on ui after we get results i.e recipes not pending results
        await state.search.getResults();//as getResults is a method of search and now search is available in state
        
        //5) Render results for ui
        clearLoader();
        searchView.renderResults(state.search.result);   //console.log(state.search.result);
    }
}


//this is controller
elements.searchForm.addEventListener('submit', e => {
    
    e.preventDefault();//it prevents page from reloading every time we submit the form 
    controlSearch();//just to make it organised else wecan even write it here
    
});

elements.searchResPage.addEventListener('click', e=> {
   const btn = e.target.closest('.btn-inline');//closest combines click 
    
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

//const search = new Search('pizza');
//console.log(search);
//search.getResults();



/********
**************************************RECIPE CONTROLER
********/


const controlRecipe = async () => {
    //1) get id from recipeView
        //we get #47767 but we want 47767
    const id = window.location.hash.replace('#', '');//as we click results in list url changes
    //console.log(id);
    
    if (id) {
        //2) storing new recipe obj in state
        state.recipe = new Recipe(id);
        
        //highlight recipe seleted
        if(state.search) searchView.highlightSelector(id);
        
        //3) prepare ui before results
        recipeView.clearResults();
        renderLoader(elements.recipe);
        
        //4) search for recipe
        try {
            await state.recipe.getRecipe();
            //console.log(state.recipe.ingredients)
            state.recipe.parseIngredients();
            
            //5) calculate servings and time
            state.recipe.calcServings();
            state.recipe.calcTime();

            //6) render results to ui
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));//putted is liked after wards

        } catch (error) {
            console.log(error);
            alert('error catching recipe');
        }
        
    }
    
};

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load',controlRecipe);


['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

//handling recipe serving button click                 //events happening in recipe block are put in here
elements.recipe.addEventListener('click', e => {
   if(e.target.matches('.btn-decrease, .btn-decrease *')) {
       //decrease is clicked
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
    
        recipeView.updateServingsIngredients(state.recipe);
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //adds ingredients to shopping cart
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    } else if (e.target.matches('.recipe__item, .recipe__item *')) { 
        
        //console.log(e.target.getAttribute('data-uniqid'));
        /*if(e.target.matches('.recipe__icon')) {
            console.log(e.target.parentNode.parentNode);
        } else */
        
        if (!e.target.matches('.recipe__item')) {
            
            //console.log(e.target.parentNode);
            contolEachListItem(e.target.parentNode.getAttribute('data-uniqid'));
            
        } else {
            
            contolEachListItem(e.target.getAttribute('data-uniqid'));
            
        }
    }
    
    //console.log(state.recipe.ingredients);
});


//const r = new Recipe(47746);
//r.getRecipe();


window.l = new List();

/******
***********************LISTCONTROLLER
******/

const contolEachListItem = (id) => {
    if(!state.list) state.list = new List();
    
    state.recipe.ingredients.forEach(el => {
        if(el.ingid === id) {
            const item = state.list.addItem(el.count, el.unit, el.ingredient);
            listView.renderItem(item);
        }
    });
};

const controlList = () => {
    //create new list if there is no list
    if(!state.list) state.list = new List();
    
    //add each ingredient to list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};

//handle delete and update list item
elements.shopping.addEventListener('click', e => {
    
    const id = e.target.closest('.shopping__item').dataset.itemid;
    
    //handle delete item
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);
        
        //delete from ui
        listView.deleteItem(id);
        
    } else if (e.target.matches('.shopping__count-value')) {
        //updating count
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
        
    }
    
});

//to delete all list items
document.querySelector('.shopping__all--delete').addEventListener('click',() => {
    
    state.list.items.forEach(it => listView.deleteItem(it.id));
    state.list.items.forEach(it => state.list.deleteItem(it.id));
    
});

/******
***********************LIKESCONTROLLER
******/
//for testing
//state.likes = new Likes()
//likesView.toggleLikeMenu(state.likes.getNumLikes());

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;
    
    //not yet liked
    if(!state.likes.isLiked(currentId)) {
        //add like to state
        const newLike = state.likes.addLike(currentId,state.recipe.author, state.recipe.title, state.recipe.img);
        
        //toggle the button
        likesView.toggleLikeBtn(true);
        
        //add like to ui list
            //console.log(state.likes);// for testing
        likesView.renderLike(newLike);
        
    } else {//already liked
        
        //same steps
        state.likes.deleteLike(currentId);
        
        //console.log(state.likes);// for testing
        
        likesView.toggleLikeBtn(false);
        likesView.deleteLike(currentId);
    }
    
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//restoring data  persisting data
window.addEventListener('load',() => {
    state.likes = new Likes();
    state.list = new List();
    
    //restores data of likes
    state.likes.readStorage();
    state.list.readStorage();
    
    //toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    
    state.likes.likes.forEach(like => likesView.renderLike(like));
    state.list.items.forEach(item => listView.renderItem(item));
});






















