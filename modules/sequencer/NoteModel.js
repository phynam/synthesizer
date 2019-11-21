class NoteModel extends Model {

    element;

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
                if(this.element) {
                    return this.element;
                }
        
                return this.element = document.getElementById(this.id);
            }
        });
    }
}