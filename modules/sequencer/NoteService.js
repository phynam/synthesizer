class NoteService extends Module {

    store;

    constructor() {

        super();

        this.store = sequencer.store;
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

        if(!this._validateUpdates(updates)) {
            return;
        }

        this.store.notes.find(id).update(updates);
    }

    create(values) {
        this.store.notes.push(new NoteModel(values));
    }

    // TODO: Move to validation class
    _validateUpdates(updates) {

        if(typeof updates.note != 'undefined' && (updates.note < 0 || updates.note >= this.store.nNotes)) {
            return false;
        }

        if(typeof updates.start != 'undefined' && updates.start < 0) {
            return false;
        }

        return true;
    }
}