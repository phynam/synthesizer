class Model extends Module {

    id;
    properties = {};
    oldProperties = {};

    constructor(properties)
    {
        super();
        
        this.properties = properties;

        Object.keys(properties).forEach(prop => {
            Object.defineProperty(this, prop, {
                get: function(val) {
                    if(this.onGet) {
                        this.onGet(prop, properties[prop]);
                    } else {
                        return properties[prop];
                    }
                },
                set: function(val) {
                    if(this.onSet) {
                        this.onSet(prop, val);
                    } else {
                        properties[prop] = val;
                    }
                }
            });
        }, this);

        this.cache();
    }

    toArray = () => {
        return JSON.parse(JSON.stringify(this.properties));
    }

    cache = () => {
        this.oldProperties = this.toArray();
        return this;
    }

    last = (key) => {
        return this.oldProperties[key];
    }

    clone = () => {
        return new this.constructor(this.toArray());
    }
}