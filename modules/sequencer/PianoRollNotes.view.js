class PianoRollNotes extends View
{
    dragThresholdPx = 8;
    currentEl;

    constructor(selector)
    {
        super(selector);
        this._bindHandlers();

        // TODO: MOVE UP TO PARENT
        this.notes = [
            [2,2.25,61,127], [4,4.5,63,127], [3,3.75,65,127], [2,2.75,67,127]
        ];
        this.gridResolutionX = 16;
        this.gridResolutionY = 128;
        this.noteHeightPx = 15;
        

        // TODO: Validate on changes to data, not to dom. if validation success - rerender


        this.el.style.height = `${this.gridResolutionY * this.noteHeightPx}px`;

        this.notes.forEach(n => {
            this.create(n);
        });

        // /TODO
    }

    handlers = {
        '.piano-roll__note:mousedown': this.onNoteMousedown,
        '.piano-roll__note:mouseup': this.onNoteMouseup,
        '.piano-roll__notes:mouseup': this.onMouseUp
    }

    /**
     * Handler methods
     */
    onNoteMousedown(e, el) {

        el.originalWidth = el.offsetWidth;
        el.originalOffsetX = _(el).offset().left;
        el.cursorStartX = e.x;
        el.cursorStartY = e.y;

        this.currentEl = el;

        if(e.offsetX < this.dragThresholdPx || e.offsetX > el.offsetWidth - this.dragThresholdPx) {
            
            /**
             * Resize note
             */
            this.onNoteResize = this.onNoteResize.bind(this);
            this.currentEl.changeOffset = e.offsetX < this.dragThresholdPx;

            document.addEventListener('mousemove', this.onNoteResize, false);
        } else {

            /**
             * Move note
             */
            this.onNoteMove = this.onNoteMove.bind(this);

            document.addEventListener('mousemove', this.onNoteMove, false);
        }
    }

    onNoteMouseup(e) {

        document.removeEventListener('mousemove', this.onNoteResize, false);
        document.removeEventListener('mousemove', this.onNoteMove, false);

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

    onNoteMove(e) {

        let offset = this._el.offset().left;
        let cursorOffset = e.target.cursorStartX - e.target.originalOffsetX;

        this.setXPosition(this.currentEl, (e.x - offset) - cursorOffset);
    }

    onMouseUp(e) {
        document.removeEventListener('mousemove', this.onNoteResize, false);
        document.removeEventListener('mousemove', this.onNoteMove, false);
    }

    /**
     * DOM Functions
     */
    create(note) {
        let el = document.createElement('div');
        el.classList.add('piano-roll__note');
        this.setXPosition(el, this.beatsToPx(note[0]));
        this.setYPosition(el, note[2] * this.noteHeightPx);
        this.setWidth(el, this.beatsToPx(note[1] - note[0]));
        this.el.appendChild(el);
    }

    setXPosition(el, xOffset) {
        el.style.left = `${this.pxToPercent(xOffset)}%` || el.style.left;
        return el;
    }

    setYPosition(el, yOffset) {
        el.style.top = `${yOffset}px`;
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