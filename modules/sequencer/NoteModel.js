class NoteModel extends Model {

    constructor(properties)
    {
        super(properties);
    }

    onSet(prop, val) {

        // Validate
        if(prop === 'note' && val > 127) {
            val = 127; // TODO: Use dynamic value
        }

        if(prop === 'note' && val < 0) {
            val = 0;
        }

        if(prop === 'start' && val < 0) {
            val = 0;
        }

        return val;
    }
}