class NoteModel extends Model {

    constructor(properties)
    {
        super(properties);
    }

    onSet(prop, val) {

        // Validate
        if(prop === 'note' && (val > 128 || val < 0)) {
            return;
        }

        if(prop === 'start' && val < 0) {
            return;
        }

        this.properties[prop] = val;
    }
}