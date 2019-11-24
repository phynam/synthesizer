(function(_, PianoRollNotes) {
    
    // View takes an object of methods and properties
    window.sequencer.view = new PianoRollNotes('[data-piano-roll-notes]');
    window.sequencer.view.renderGrid();
    window.sequencer.view.render();

    var n = [
        [2,2.25,127,127], [4,4.5,126,127], [3,3.75,125,127], [2,4,123,127], [1,0.5,123,128]
    ];
    
    n = n.map(n => {
        return new NoteModel({
            start: n[0],
            duration: n[1],
            note: n[2],
            velocity: n[3]
        });
    });

    window.sequencer.store.notes.set(n);

})(_, PianoRollNotes);