class Collection extends Module
{
    items = [];

    constructor(items)
    {
        super();
        
        this.set(items);
    }

    all = () => {
        return this.items;
    }

    find = (id) => {
        return this.items.find(x => {
            return x.id === id;
        });
    }

    push = (item) => {
        this.items.push(item);
        return this;
    }

    set = (items) => {
        this.items = items;
        return this;
    }

    each = (cb) => {
        for(let i = 0; i < this.items.length; i++) {
            cb(this.items[i]);
        }
    }

    clear = () => {
        this.items = [];
        return this;
    }
}