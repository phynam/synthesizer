window.sequencer = window.sequencer || {};
window.sequencer.store = new Model();

window.sequencer.store.update({
    nBeatsInSequence: 16,
    nNotes: 128,
    division: 0.25
});

window.sequencer.store.set('notes', new NoteCollection());
window.sequencer.store.set('selection', new SelectionCollection(sequencer.store));