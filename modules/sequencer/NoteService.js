class NoteService extends Module {

    store;
    validator;
    boundsExceeded = {
        start: false,
        note: false
    }

    constructor() {

        super();

        this.store = sequencer.store;
        this.validator = new Validator({
            note: {
                min: 1,
                max: this.store.nNotes,
            },
            start: {
                min: 0,
                max: this.store.nBeatsInSequence
            },
            duration: {
                min: this.store.division
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

    hasSelection() {
        this.store.selection.all().length > 0;
    }

    selection() {
        let selection = this.store.selection.all();

        return new Collection(this.store.notes.where(n => {
            return selection.includes(n.id);
        }))
    }

    split(id, beat) {
        let donor = this.store.notes.find(id), 
            a = donor.toArray(), 
            b = donor.toArray();

        delete a.id;
        delete b.id;

        // Calculate split point
        let aDuration = beat - a.start;

        a.duration = aDuration;
        b.duration = b.duration - a.duration;
        b.start = a.start + a.duration

        this.store.notes.remove(donor.id);
        
        this.create(a);
        this.create(b);
    }

    update(id, updates) {
        // TODO: Validate here, set range values
        //updates = this._validateUpdates(updates);
        // Check if there are overlaps
        return this.store.notes.find(id).update(updates);
    }

    // Refactor to resize, move, resizeright? TODO
    bulkUpdate(updates) {

        let validation

        for(let i = 0; i < updates.length; i++) {
            validation = this.validator.validate(updates[i]);

            if(validation.hasErrors()) {
                break;
            }
        }

        // If has errors
            // If bounds are crossed and not flagged
            //// Loop over updates, and set each to the bound
            //// Set flag to crossed
            // If bounds are crossed and flag is set
            //// Delete flagged props from update
        // If no errors
            // Reset all flags

        if(validation.hasErrors()) {

            let errors = validation.getErrors();

            Object.keys(errors).forEach(key => {

                if(! this.boundsExceeded[key]) {
                    updates.forEach(u => {
                        if(u.start) {

                            let error = validation.getError('start', 'min');

                            if(error) {
                                u.start = u.start + Math.abs(error.actual);
                            }
                        }

                        if(u.note) {

                            // let error = validation.getError('note', 'min');

                            // if(error) {
                            //     u.note = u.note + Math.abs(error.actual);
                            // }

                            let error = validation.getError('note', 'max');

                            if(error) {
                                u.note = u.note - (error.actual - error.expected);
                            }
                        }

                        if(u.duration) {

                            let error = validation.getError('duration', 'min');

                            if(error) {
                                u.duration = u.duration - (error.actual - error.expected);
                            }
                        }
                    });

                    this.boundsExceeded[key] = true;
                } else {
                    updates.forEach(u => {
                        delete u[key];
                    });
                }
            });
        } else {
            this.boundsExceeded['note'] = false;
            this.boundsExceeded['start'] = false;
        }

        updates.forEach(u => {
            let id = u.id;
            delete u.id;
            this.update(id, u);
        });
    }

    create(values) {
        values.duration = values.duration || this.store.division;
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