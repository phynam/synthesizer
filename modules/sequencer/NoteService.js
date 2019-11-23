class NoteService extends Module {

    store;
    validator;

    constructor() {

        super();

        this.store = sequencer.store;
        this.validator = new Validator({
            note: {
                min: 1,
                max: this.store.nNotes
            },
            start: {
                min: 0,
                max: this.store.nBeatsInSequence
            }
        });
        
    }

    setSelection(ids) {
        if(!Array.isArray(ids)) {
            ids = [ids];
        }

        this.store.selection.set(ids);

        return this.selection();
    }

    clearSelection() {
        this.store.selection.clear();
    }

    addToSelection(id) {
        this.store.selection.push(id);

        return this.selection();
    }

    selection() {
        let selection = this.store.selection.all();

        return new Collection(this.store.notes.where(n => {
            return selection.includes(n.id);
        }))
    }

    update(id, updates) {
        // TODO: Validate here, set range values
        //updates = this._validateUpdates(updates);
        this.store.notes.find(id).update(updates);
    }

    bulkUpdate(updates) {

        let validation

        for(let i = 0; i < updates.length; i++) {
            validation = this.validator.validate(updates[i]);

            if(validation.hasErrors()) {
                break;
            }
        }

        /**
         * Keep full selection within range TODO: Rewrite
         */
        if(validation.hasErrors()) {
            updates.forEach(u => {
                if(u.start) {
                    let error = validation.getError('start', 'min');

                    if(error) {
                        u.start = u.start + Math.abs(error.actual);
                    }
                }

                if(u.note) {

                    let error = validation.getError('note', 'min');

                    if(error) {
                        u.note = u.note + Math.abs(error.actual);
                    }

                    error = validation.getError('note', 'max');

                    if(error) {
                        u.note = u.note  - (error.actual - error.expected);
                    }
                }
            });
        }

        updates.forEach(u => {
            let id = u.id;
            delete u.id;
            this.update(id, u);
        });
    }

    create(values) {
        values.duration = this.store.division;
        this.store.notes.push(new NoteModel(values));
    }

    // TODO: Move to validation class
    _validateUpdates(updates) {

        if(typeof updates.note != 'undefined' && updates.note < 1) {
            updates.note = 1;
        }

        if(typeof updates.note != 'undefined' && updates.note > this.store.nNotes) {
            updates.note = this.store.nNotes;
        }

        if(typeof updates.start != 'undefined' && updates.start < 0) {
            updates.start = 0;
        }
        
        return updates;
    }
}