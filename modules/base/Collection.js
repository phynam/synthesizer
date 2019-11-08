class Collection extends Module
{
    items = [];

    constructor(items)
    {
        super();
        
        this.set(items, true);
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
        this._bindChildHandlers(item);
        this.items.push(item);
        this.publish('push', item);
        return this;
    }

    size = () => {
        return this.items.length;
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