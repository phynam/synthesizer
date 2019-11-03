class PianoRollNotes extends View
{
    dragThresholdPx = 6;
    currentEl;

    constructor(selector)
    {
        super(selector);
        this._bindHandlers();

        // TODO: MOVE UP TO PARENT
        this.notes = [
            [2,2.25,60,127], [15,16,60,127]
        ];

        // TODO: Validate on changes to data, not to dom. if validation success - rerender

        this.gridResolutionX = 16;

        this.notes.forEach(n => {
            this.create(n);
        });

        // /TODO
    }

    handlers = {
        '.piano-roll__note:mousedown': this.onNoteMousedown,
        '.piano-roll__note:mouseup': this.onNoteMouseup
    }

    /**
     * Handler methods
     */
    onNoteMousedown(e, el) {

        el.originalWidth = el.offsetWidth;
        el.cursorStartX = e.x;
        el.cursorStartY = e.y;

        this.currentEl = el;

        /**
         * Resize note
         */
        if(e.offsetX < this.dragThresholdPx || e.offsetX > el.offsetWidth - this.dragThresholdPx) {
            this.onNoteResize = this.onNoteResize.bind(this);
            this.currentEl.changeOffset = e.offsetX < this.dragThresholdPx;
            document.addEventListener('mousemove', this.onNoteResize, false);
        }
    }

    onNoteMouseup(e) {

        document.removeEventListener('mousemove', this.onNoteResize, false);
        // Store value
    }

    onNoteResize(e) {

        let offset = this._el.offset().left,
            attenuation = e.x - this.currentEl.cursorStartX;

        if(this.currentEl.changeOffset) {
            this.setXPosition(this.currentEl, e.x - offset);
            attenuation = -attenuation;
        }

        this.setWidth(this.currentEl, attenuation + this.currentEl.originalWidth);
    }

    /**
     * DOM Functions
     */
    create(note) {
        let el = document.createElement('div');
        el.classList.add('piano-roll__note');
        this.setXPosition(el, this.beatsToPx(note[0]));
        this.setWidth(el, this.beatsToPx(note[1] - note[0]));
        this.el.appendChild(el);
    }

    setXPosition(el, xOffset) {
        el.style.left = `${this.pxToPercent(xOffset)}%` || el.style.left;
        return el;
    }

    setWidth(el, width) {
        el.style.width = `${this.pxToPercent(width)}%` || el.style.width;
    }

    /**
     * Helper functions
     */
    beatsToPercent(beats) {
        return beats / this.gridResolutionX * 100;
    }

    beatsToPx(beats) {
        return beats / this.gridResolutionX * this.el.offsetWidth;
    }

    pxToPercent(px) {
        return px / this.el.offsetWidth * 100;
    }

}

window.PianoRollNotes = PianoRollNotes;