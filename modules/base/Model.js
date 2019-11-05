class Model extends Module {

    id;
    properties = {};

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

        this.id = Date.now() + ~~((Math.random() * 1000) + 1);
    }

    toArray = (includeId) => {
        let p = JSON.parse(JSON.stringify(this.properties));

        if(includeId) {
            p.id = this.id;
        }

        return p;
    }
}