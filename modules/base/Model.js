class Model {

    id;
    properties = {};

    constructor(properties)
    {
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
}