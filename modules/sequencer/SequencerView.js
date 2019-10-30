class SequencerView extends View
{
    constructor(selector)
    {
        super(selector);
        this._bindHandlers();
    }

    handlers = {
        '.sequencer__step:click': this.handleStepClick
    }

    handleStepClick(e, el) {
        
    }
}

window.SequencerView = SequencerView;