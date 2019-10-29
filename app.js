(function(_) {

    let handleSequencerClick = (n, e) => {
        console.log(n);
    }

    const SELECTORS = {
        '.sequencer__step': handleSequencerClick
    };

    Object.keys(SELECTORS).forEach(key => {
        _(key).on('click', SELECTORS[key]);
    });

    // View takes an object of methods and properties


})(_);