class PianoRollNotes extends View
{
    dragThresholdPx = 8;
    currentEl;

    constructor(selector)
    {
        super(selector);
        this._bindHandlers();

        document.addEventListener('mouseup', this.removeMoveHandlers.bind(this));

        // TODO: MOVE UP TO PARENT
        this.notes = [
            [2,2.25,128,127], [4,4.5,127,127], [3,3.75,126,127], [2,2.75,125,127]
        ];

        this.gridResolutionX = 16;
        this.gridResolutionY = 128;
        this.rowHeightPx = 16;
        this.noteHeightPx = 15;

        // TODO: Validate on changes to data, not to dom. if validation success - rerender
        this.el.style.height = `${(this.gridResolutionY + 1) * this.rowHeightPx}px`;

        this.notes.forEach(n => {
            this.create(n);
        });

        // /TODO
    }

    handlers = {
        'mousedown:.piano-roll__note': this.onNoteMousedown,
        'mouseup:.piano-roll__note': this.onNoteMouseup
    }

    /**
     * Handler methods
     */
    onNoteMousedown(e, el) {

        el.originalWidth = el.offsetWidth;
        el.originalOffsetX = _(el).offset().left;
        el.originalOffsetY = _(el).offset().top;
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

        let offsetX = this._el.offset().left,
            offsetY = this._el.offset().top,
            cursorOffsetX = this.currentEl.cursorStartX - this.currentEl.originalOffsetX,
            rowsMoved = Math.floor((this.currentEl.originalOffsetY - e.y) / this.rowHeightPx) + 1;
            
        this.setYPosition(this.currentEl, -(rowsMoved * this.rowHeightPx) + this.currentEl.originalOffsetY + offsetY);
        this.setXPosition(this.currentEl, e.x - offsetX - cursorOffsetX);
    }

    removeMoveHandlers() {
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
        this.setYPosition(el, (this.gridResolutionY - note[2]) * this.rowHeightPx);
        this.setWidth(el, this.beatsToPx(note[1] - note[0]));

        this.el.appendChild(el);
    }

    setXPosition(el, xOffset) {
        el.style.left = `${this.pxToPercent(xOffset)}%` || el.style.left;
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