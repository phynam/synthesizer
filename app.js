(function(_, SequencerView) {
    
    // View takes an object of methods and properties
    window.view = new SequencerView('#sequencer');

    window.view.bus.subscribe('Test', p => {
        console.log(p);
    });

})(_, SequencerView);