class PianoRollView extends View
{
    constructor(selector)
    {
        super(selector);
        this._bindHandlers();
    }

    handlers = {
        '.piano-roll__note:click': this.onStepClick
    }

    onStepClick(e, el) {
        console.log(this);
        this.bus.publish('note:select', []);
    }

    render = () => {
        // Iterate over all the notes in array and render their positions to the DOM
    }
}

window.PianoRollView = PianoRollView;