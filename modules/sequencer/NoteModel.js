class NoteModel extends Model {

    constructor(properties)
    {        
        let defaults = {
            id: Date.now() + ~~((Math.random() * 1000) + 1), // TODO: Move to service?
            velocity: 100
        };

        super(Object.assign({}, defaults, properties));

        // TODO: Write as getters lower down?
        Object.defineProperty(this, 'el', {
            get: x => {
                return document.getElementById(this.id);
            }
        });

        Object.defineProperty(this, 'end', {
            get: x => {
                return this.properties.start + this.properties.duration;
            }
        });
    }
}