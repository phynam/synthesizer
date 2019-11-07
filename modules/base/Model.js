class Model extends Module {

    properties = {};
    oldProperties = {};

    constructor(properties)
    {
        super();

        if(properties) {
            this.set(properties);
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

    set = (sample, val) => {

        if(typeof sample === 'object') {
            Object.keys(sample).forEach(key => {
                this.set(key, sample[key]);
            });
        }

        if(typeof sample === 'string' && val) {
            if(this.properties[sample] === val) {
                return;
            }

            if(! Object.getOwnPropertyDescriptor(this, sample)) {
                this._defineProperty(sample);
            }

            this.properties[sample] = val;
            
            this.bus.publish('set', sample, val);
        }
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
                if(this.onSet) {
                    this.onSet(prop, val);
                } else {
                    this.set(prop, val);
                }
            }
        });
    }
}