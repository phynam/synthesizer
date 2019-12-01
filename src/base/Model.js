import {Module} from 'base/Module';

class Model extends Module {

    properties = {};
    oldProperties = {};
    defaults = {};

    constructor(properties)
    {
        super();

        if(properties) {
            properties = Object.assign({}, this.defaults, properties);

            this.update(properties, true);
        }
    }

    /**
     * Deep clone properties object.
     */
    toArray = () => {
        return JSON.parse(JSON.stringify(this.properties));
    }

    /**
     * Save current properties.
     */
    cache = () => {
        this.oldProperties = this.toArray();
        return this;
    }

    /**
     * Get the previous (saved) version of a given property.
     */
    last = (key) => {
        return this.oldProperties[key];
    }

    /**
     * Deep clone properties object and create a new identical model instance.
     */
    clone = () => {
        return new this.constructor(this.toArray());
    }

    /**
     * Set a key value pair on the instance.
     */
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

    /**
     * Update multiple key value pairs on the instance. Optionally cache the object.
     */
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

    /**
     * Define event aware setters.
     */
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

export {Model};