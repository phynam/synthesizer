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

        this.each(item => {

            // TODO: This sucks, rewrite it.
            
            if(item instanceof Module) {
                Object.keys(this.bus.events).forEach(eventName => {
                    if(eventName.includes('item')) {
                        this.bus.events[eventName].forEach(f => {
                            item.bus.subscribe(eventName.split(':')[1], f);
                        });
                    }
                });
            }
        });

        return this;
    }

    each = (cb) => {
        for(let i = 0; this.items && i < this.items.length; i++) {
            cb(this.items[i]);
        }
    }

    clear = () => {
        this.items = [];
        return this;
    }
}