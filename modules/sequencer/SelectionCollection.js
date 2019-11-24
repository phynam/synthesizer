class SelectionCollection extends Collection
{
    selected = [];

    constructor(store) {
        super();
        
        this.store = store;
    }

    get items() {
        return new Collection(this.store.notes.where(n => {
            return this.selected.includes(n.id);
        }))
    }

    set items(items) {
        this.selected = items;
    }
}