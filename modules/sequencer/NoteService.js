class NoteService extends Module {

    store;
    boundsExceeded = {
        start: false,
        note: false
    }

    constructor() {

        super();

        this.store = sequencer.store;
    }

    setSelection(ids) {
        if(!Array.isArray(ids)) {
            ids = [ids];
        }

        this.store.selection.set(ids);

        return this.store.selection.all();
    }

    clearSelection() {
        this.store.selection.clear();
    }

    addToSelection(id) {
        this.store.selection.push(id);
        return this.store.selection.all();
    }

    hasSelection() {
        this.store.selection.all().length > 0;
    }

    split(id, beat) {
        let donor = this.store.notes.find(id);

        if(!donor || (donor.start > beat || donor.duration + donor.start <= beat)) {
            return;
        }

        let a = donor.toArray(), b = donor.toArray();

        delete a.id;
        delete b.id;

        // Calculate split point
        let aDuration = beat - a.start;

        a.duration = aDuration;
        b.duration = b.duration - a.duration;
        b.start = a.start + a.duration

        this.store.notes.remove(donor.id);

        return [this.create(a), this.create(b)];
    }

    update(id, updates) {
        // TODO: Validate here, set range values
        //updates = this._validateUpdates(updates);
        return this.store.notes.find(id).update(updates);
    }

    updateOverlappingNotes(note) {

        let selectedNotes = this.store.notes.whereWithinRange(
            note.start, note.end, note.note, note.note
        );

        // TODO: refactor to use recursion
        selectedNotes.forEach(scratch => {
            if(scratch.id === note.id) {
                return;
            }

            // If start and end are both larger, split down the middle
            if(scratch.start < note.start && scratch.end > note.end) {
                scratch = this.split(scratch.id, note.start)[1];
                this.update(scratch.id, {
                    start: note.end,
                    duration: scratch.end - note.end
                }).cache();
                return;
            }

            // If start and end are both covered, delete
            if(scratch.start >= note.start && scratch.end <= note.end) {
                this.store.notes.remove(scratch.id);
                return;
            }

            // If only end is covered, resize left TODO:Refactor resize
            if(scratch.start >= note.start && scratch.end >= note.end) {
                this.update(scratch.id, {
                    start: note.end,
                    duration: scratch.end - note.end
                }).cache();
                return;
            }

            // If end is covered, resize right
            if(scratch.start <= note.start || scratch.end <= note.start) {
                this.update(scratch.id, {
                    duration: note.start - scratch.start
                }).cache();
                return;
            }
        });
    }

    offsetNoteBy(id, noteOffset) {

    }

    offsetBeatBy(id, beatOffset) {

    }

    moveMultiple(updates) {
        
    }

    resizeLeftMultiple(updates) {
    }

    resizeRightMultiple(updates) {
    }

    // /**
    //  * Determine if at least one update has a validation error.
    //  * 
    //  * @param {array} updates 
    //  */
    // _validateMultiple(updates) {
    //     let validation;

    //     for(let i = 0; i < updates.length; i++) {
    //         validation = this.validator.validate(updates[i]);

    //         if(validation.hasErrors()) {
    //             break;
    //         }
    //     }

    //     return validation;
    // }

    // Refactor to resize, move, resizeright? TODO
    bulkUpdate(updates) {

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
        let note = new NoteModel();

        note.update(values, true);

        this.store.notes.push(note);
        
        return note;
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

var noteService = new NoteService();