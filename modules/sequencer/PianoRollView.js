class PianoRollView extends View
{
    dragThresholdPx = 5;
    currentNote;

    constructor(selector)
    {
        super(selector);
        this._bindHandlers();
    }

    handlers = {
        '.piano-roll__note:mousedown': this.onNoteMousedown,
        '.piano-roll__note:mouseup': this.onNoteMouseup
    }

    onNoteMousedown(e, el) {
        if(e.offsetX < this.dragThresholdPx || e.offsetX > el.offsetWidth - this.dragThresholdPx) {
            document.addEventListener('mousemove', this.resizeNote, false);
        }
    }

    onNoteMouseup(e, el) {
        console.log('up');
        document.removeEventListener('mousemove', this.resizeNote, false);
    }

    resizeNote = (e) => {
        console.log(e.offsetX);
    }

    render = () => {
        // Iterate over all the notes in array and render their positions to the DOM
    }
}

window.PianoRollView = PianoRollView;