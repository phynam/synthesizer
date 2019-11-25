class NoteModel extends ValidatingModel {

    constructor(properties)
    {        
        let defaults = {
            id: Date.now() + ~~((Math.random() * 1000) + 1), // TODO: Move to service?
            velocity: 100
        };

        let validations = {
            note: {
                min: 1, // TODO: Use 0 - 127?
                max: 128
            },
            start: {
                min: 0
            },
            duration: {
                min: 0.25
            }
        }

        super(Object.assign({}, defaults, properties), validations);

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