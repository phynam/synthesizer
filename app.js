(function(_, PianoRollNotes) {
    
    // View takes an object of methods and properties
    window.sequencer.view = new PianoRollNotes('[data-piano-roll-notes]');
    window.sequencer.view.render();

    var n = [
        [2,2.25,127,127], [4,4.5,126,127], [3,3.75,125,127], [2,4,124,127]
    ];
    
    n = n.map(n => {
        return new NoteModel({
            id: Date.now() + ~~((Math.random() * 1000) + 1),
            start: n[0],
            end: n[1],
            note: n[2],
            velocity: n[3]
        });
    });

    window.sequencer.store.notes.set(n);

})(_, PianoRollNotes);