class Model extends Module {

    properties = {};
    oldProperties = {};
    defaults = {};

    constructor(properties)
    {
        super();

        if(properties) {
            properties = Object.assign({}, this.defaults, properties);
        }
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

    set = (key, val) => {
        if(this.properties[key] === val) {
            return;
        }

        if(! Object.getOwnPropertyDescriptor(this, key)) {
            this._defineProperty(key);
        }

        if(this._onSet) {
            val = this._onSet(key, val);

            if(!val) {
                return false;
            }
        }

        this.properties[key] = val;
        
        this.publish('set', key, this.properties[key], this);

        return this.properties[key];
    }

    update = (settings, cache) => {
        Object.keys(settings).forEach(key => {
            this.set(key, settings[key]);
        });

        if(cache) {
            this.cache();
        }

        this.publish('update', settings, this);
        
        return this;
    }

    _defineProperty = (prop) => {
        Object.defineProperty(this, prop, {
            get: function() {
                return this.properties[prop];
            },
            set: function(val) {
                this.set(prop, val);
            }
        });
    }
}