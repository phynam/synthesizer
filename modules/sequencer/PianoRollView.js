class PianoRollView extends View
{
    dragThresholdPx = 5;

    constructor(selector)
    {
        super(selector);
        this._bindHandlers();

        // TODO: Throwaway
        this.notes = [
            [1,1.25,60,127]
        ];

        this.gridResolutionX = 16;


        this.renderNotes();
    }

    handlers = {
        '.piano-roll__note:mousedown': this.onNoteMousedown,
        '.piano-roll__note:mouseup': this.onNoteMouseup
    }

    /**
     * Handler methods
     */
    onNoteMousedown(e, el) {
        if(e.offsetX < this.dragThresholdPx || e.offsetX > el.offsetWidth - this.dragThresholdPx) {
            document.addEventListener('mousemove', this.onNoteResize, false);
        }
    }

    onNoteMouseup(e) {
        document.removeEventListener('mousemove', this.onNoteResize, false);
    }

    onNoteResize(e) {

    }

    /**
     * Render methods
     */
    renderNotes = () => {
        let template = '';
        for(let i = 0; i < this.notes.length; i++) {

            let note = this.notes[i];

            // Convert start point to position

            template += this.noteTemplate(
                this.asPercentage(note[1] - note[0]), 
                this.asPercentage(note[0] - 1)
            );
        }

        this.el.innerHTML = template;
    }

    /**
     * Template methods
     */
    noteTemplate = (width = 0, offsetLeft = 0, offsetTop = 0) => {
        return `<div class="piano-roll__note" role="button" style="width:${width}%; left:${offsetLeft}%; top:${offsetTop}px"></div>`;
    }

    /**
     * Helper methods
     */
    asPercentage = (x) => {
        return x / this.gridResolutionX * 100;
    }
}

window.PianoRollView = PianoRollView;