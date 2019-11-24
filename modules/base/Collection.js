class Collection extends Module
{
    items = [];

    constructor(items)
    {
        super();
        
        this.set(items, true);
    }

    where = (cb) => {
        return this.items.filter(cb);
    }

    all = () => {
        return this.items;
    }

    find = (id) => {
        return this.items.find(x => {
            return x.id === id;
        });
    }

    remove = (id) => {

        let index = this.items.findIndex(item => {
            return item.id === id;
        });

        let x = this.items.splice(index, 1)[0];

        this.publish('remove', x);

        return x;
    }

    push = (item) => {
        this._bindChildHandlers(item);
        this.items.push(item);
        this.publish('push', item);
        return this;
    }

    size = () => {
        return this.items.length;
    }
    
    first = () => {
        return this.items[0];
    }

    set = (items, quiet = false) => {
        if(!items) {
            return;
        }

        items.forEach(item => {
            this._bindChildHandlers(item);
        });

        this.items = items;

        if(!quiet) {
            this.publish('set', items);
        }

        return this;
    }

    each = (cb) => {
        for(let i = 0; this.items && i < this.items.length; i++) {
            cb(this.items[i]);
        }
    }

    map = (cb) => {
        return this.items.map(cb);
    }

    clear = () => {
        this.publish('clear', this.items);
        this.items = [];
        return this;
    }

    _bindChildHandlers = (item) => {

        // TODO: Rewrite this... 
        
        if(item instanceof Module) {
            Object.keys(this.events).forEach(eventName => {
                if(eventName.includes('item')) {
                    this.events[eventName].forEach(f => {
                        item.subscribe(eventName.split(':')[1], f);
                    });
                }
            });
        }
    }
}