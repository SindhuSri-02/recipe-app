import uniqid from 'uniqid';

export default class List {
    constructor() {
        this.items = [];
    }
    
    addItem(count, unit, ingredient) {
        const item = {
            count,
            unit,
            ingredient,
            id: uniqid()
        }
        
        this.items.push(item);
        
        this.persistData();
        
        return item;
    }
    
    deleteItem (id) {
        const index = this.items.findIndex(el => el.id === id);
        //splice returns nums arr we mention and del from org arr
        //whereas slice doesnt del from org arr
        this.items.splice(index, 1);
        
        this.persistData();
    }
    
    updateCount(id, newCount) {
        this.item.find(el => el.id === id).count = newCount;
    }
    
    persistData() {
        localStorage.setItem('list', JSON.stringify(this.items));
    }
    
    readStorage() {
        const storage = JSON.parse(localStorage.getItem('list'));
        
        if(storage) this.items = storage; 
    }
}