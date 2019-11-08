class Model extends Module {

    properties = {};
    oldProperties = {};

    constructor(properties)
    {
        super();

        if(properties) {
            this.update(properties);
            this.cache();
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

        if(this.onSet) {
            this.onSet(key, val);
        } else {
            this.properties[key] = val;
        }
        
        this.publish('set', key, val, this);
    }

    update = (settings) => {
        Object.keys(settings).forEach(key => {
            this.set(key, settings[key]);
        });

        this.publish('update', settings, this);
    }

    _defineProperty = (prop) => {
        Object.defineProperty(this, prop, {
            get: function() {
                if(this.onGet) {
                    this.onGet(prop, this.properties[prop]);
                } else {
                    return this.properties[prop];
                }
            },
            set: function(val) {
                this.set(prop, val);
            }
        });
    }
}