class NoteModel extends Model {

    constructor(properties)
    {        
        let defaults = {
            id: Date.now() + ~~((Math.random() * 1000) + 1),
            velocity: 100
        };

        super(Object.assign({}, defaults, properties));

        // TODO: Write as getter lower down?
        Object.defineProperty(this, 'el', {
            get: x => {
                return document.getElementById(this.id);
            }
        });
    }
}