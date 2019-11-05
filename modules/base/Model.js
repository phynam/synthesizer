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
                get: function () {
                    return properties[prop];
                },
                set: function (val) {
                    properties[prop] = val;
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