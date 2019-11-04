class PianoRollNotes extends View
{
    dragThresholdPx = 8;
    rowHeightPx = 15;
    currentEl;

    settings = {
        nBeatsInSequence: 16,
        nNotes: 128
    }

    constructor(selector)
    {
        super(selector);
        this._bindHandlers();

        document.addEventListener('mouseup', this.removeMoveHandlers.bind(this));

        /**
         * Controller logic
         * 
         * TODO: MOVE UP TO PARENT
         */
        var notes = [
            [2,2.25,127,127], [4,4.5,126,127], [3,3.75,125,127], [2,4,124,127]
        ];

        this.render({
            notes: notes,
            nBeatsInSequence: 16,
            nNotes: 128
        });
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
            this._setXposition(this.currentEl, e.x - offset);
            attenuation = -attenuation;
        }

        this._setWidth(this.currentEl, attenuation + this.currentEl.originalWidth);
    }

    onNoteMove(e) {

        let offsetX = this._el.offset().left,
            offsetY = this._el.offset().top,
            cursorOffsetX = this.currentEl.cursorStartX - this.currentEl.originalOffsetX,
            rowsMoved = Math.floor((this.currentEl.originalOffsetY - e.y) / this.rowHeightPx) + 1;
            
        this._setYposition(this.currentEl, -(rowsMoved * this.rowHeightPx) + (this.currentEl.originalOffsetY - offsetY));
        this._setXposition(this.currentEl, e.x - offsetX - cursorOffsetX);
    }

    removeMoveHandlers() {
        document.removeEventListener('mousemove', this.onNoteResize, false);
        document.removeEventListener('mousemove', this.onNoteMove, false);
    }

    /**
     * DOM Functions
     * 
     * Take an array of settings notes and update the DOM if necessary
     * 
     * @param {array} notes 
     */
    render(settings) {

        if(settings.nBeatsInSequence) {
            this.settings.nBeatsInSequence = settings.nBeatsInSequence;
            this._renderGrid();
        }

        if(settings.nNotes) {
            this.settings.nNotes = settings.nNotes;
            this._renderGrid();
        }

        if(settings.notes) {
            this._renderNotes(settings.notes);
        }
    }

    /**
     * Take an array of notes and remove them from the DOM
     * 
     * @param {array} notes 
     */
    delete(notes) {

    }

    /**
     * Internal DOM functions
     */
    _renderGrid() {
        this.el.style.height = `${(this.settings.nNotes) * this.rowHeightPx}px`;
    }

    _renderNotes(notes) {

        let _notes = _('.piano-roll__note');

        notes.forEach(newNote => {

            // Find DOM note with matching start time and note ID
            let result = _notes.find(domNote => {
                return domNote.noteData[0] === newNote[0] && domNote.noteData[2] === newNote[2]
            });

            // Create if it doesn't already exist and render to the DOM
            if(!result) {
                result = this._createNoteElement(newNote);
                this.el.appendChild(result);
            }

            // Set position 
            this._setNotePosition(result, newNote);
        });
    }

    _createNoteElement(note) {
        let el = document.createElement('div');
        el.classList.add('piano-roll__note');
        el.noteData = note;

        return el;
    }

    _setNotePosition(el, note) {
        this._setXposition(el, this.beatsToPx(note[0]));
        this._setYposition(el, (this.settings.nNotes - note[2]) * this.rowHeightPx);
        this._setWidth(el, this.beatsToPx(note[1] - note[0]));
    }

    _setXposition(el, xOffset) {
        el.style.left = `${this.pxToPercent(xOffset)}%` || el.style.left;
    }

    _setYposition(el, yOffset) {
        el.style.top = `${yOffset}px`;
    }

    _setWidth(el, width) {
        el.style.width = `${this.pxToPercent(width)}%` || el.style.width;
    }

    /**
     * Helper functions
     */
    beatsToPercent(beats) {
        return beats / this.settings.nBeatsInSequence * 100;
    }

    beatsToPx(beats) {
        return beats / this.settings.nBeatsInSequence * this.el.offsetWidth;
    }

    pxToPercent(px) {
        return px / this.el.offsetWidth * 100;
    }
}

window.PianoRollNotes = PianoRollNotes;