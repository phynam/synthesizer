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

    selection() {
        let selection = this.store.selection.all();

        return new Collection(this.store.notes.where(n => {
            return selection.includes(n.id);
        }))
    }

    update(id, updates) {
        this.store.notes.find(id).update(updates);
    }
}