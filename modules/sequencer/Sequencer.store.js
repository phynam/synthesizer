window.sequencer = window.sequencer || {};
window.sequencer.store = new Model({
    nBeatsInSequence: 16,
    nNotes: 128
});

window.sequencer.store.set('notes', new Collection());
window.sequencer.store.set('selection', new Collection());