import {Collection} from 'base/Collection';

class SelectionCollection extends Collection
{
    selected = [];

    get items() {
        return new Collection(store.notes.where(n => {
            return this.selected.includes(n.id);
        }))
    }

    set items(items) {
        this.selected = items;
    }
}

export {SelectionCollection};