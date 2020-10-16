import axios from 'axios';//used instead of fetch(because it doesnt work on some browsers)

export default class Search {
    
    constructor(query) {
        
        this.query = query;
        
    }

    async getResults() { //this is method
        
        const proxy = 'https://cors-anywhere.herokuapp.com/';
        
        try {
            
            const res = await axios(`${proxy}https://forkify-api.herokuapp.com/api/search?&q=${this.query}`); //returns promise
            this.result = res.data.recipes;//using this because we are storing it as property of method and we are getting this from outside
            //console.log(this.result);
            
        } catch(error) {
            
            alert(error);
            
        }
    }
}
