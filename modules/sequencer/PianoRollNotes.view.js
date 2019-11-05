class PianoRollNotes extends View
{
    dragThresholdPx = 8;
    rowHeightPx = 15;

    currentSelection;
    lastCursorPositionY;
    lastCursorPositionX;

    settings = {
        nBeatsInSequence: 16,
        nNotes: 128
    }

    constructor(selector)
    {
        super(selector);
        this._bindInterfaceHandlers();

        this.currentSelection = new CurrentSelectionCollection();

        /**
         * Remove stray resize handlers.
         */
        document.addEventListener('mouseup', this.removeMoveHandlers.bind(this));

        /**
         * Controller logic
         * 
         * TODO: MOVE UP TO GLOBAL SINGLETON
         */
        window.notes = [
            [2,2.25,127,127], [4,4.5,126,127], [3,3.75,125,127], [2,4,124,127]
        ];

        window.notes = notes.map(n => {
            return new Model({
                start: n[0],
                end: n[1],
                note: n[2],
                velocity: n[3]
            });
        });

        window.notes = new Collection(window.notes);

        this.render({
            notes: window.notes.all(),
            nBeatsInSequence: 16,
            nNotes: 128
        });
    }

    interfaceHandlers = {
        'mousedown:.piano-roll__note': this.onNoteMousedown,
        'mouseup:.piano-roll__note': this.onNoteMouseup,
        'click:.piano-roll__notes': this.onGridClick
    }

    /**
     * Handler methods
     */
    onNoteMousedown(e, el) {

        let note = window.notes.find(+el.id);

        this.currentSelection.clear().push(note, el);

        this.lastCursorPositionX = e.pageX;
        this.lastCursorPositionY = e.pageY;

        this.onNoteMove = this.onNoteMove.bind(this);
        document.addEventListener('mousemove', this.onNoteMove, false);

        // el.originalWidth = el.offsetWidth;
        // el.originalOffsetX = _(el).offset().left;
        // el.originalOffsetY = _(el).offset().top;
        // el.cursorStartX = e.x;
        // el.cursorStartY = e.y;

        // this.currentEl = el;

        // if(e.offsetX < this.dragThresholdPx || e.offsetX > el.offsetWidth - this.dragThresholdPx) {
            
        //     /**
        //      * Resize note
        //      */
        //     this.onNoteResize = this.onNoteResize.bind(this);
        //     this.currentEl.changeOffset = e.offsetX < this.dragThresholdPx;
        //     document.addEventListener('mousemove', this.onNoteResize, false);
        // } else {

        //     /**
        //      * Move note
        //      */
        //     this.onNoteMove = this.onNoteMove.bind(this);
        //     document.addEventListener('mousemove', this.onNoteMove, false);
        // }
    }

    onNoteMove(e) {
        let dragDistanceX = e.pageX - this.lastCursorPositionX,
            dragDistanceY = e.pageY - this.lastCursorPositionY,
            noteOffset = -Math.floor(dragDistanceY / this.rowHeightPx);

        this.currentSelection.each(n => {

            n.start = this._pxToBeats(dragDistanceX) + n.original.start;
            n.note = n.original.note + noteOffset;

            this._renderNotePosition(n.el, n);
        });
    }

    onNoteMouseup(e) {

    }

    onNoteResize(e) {

        // let offset = this._el.offset().left,
        //     attenuation = e.x - this.currentEl.cursorStartX;

        // if(this.currentEl.changeOffset) {
        //     this._renderXPosition(this.currentEl, e.x - offset);
        //     attenuation = -attenuation;
        // }

        // this._setWidth(this.currentEl, attenuation + this.currentEl.originalWidth);
    }

    onGridClick(e) {
        this.currentSelection.clear();
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
     * Internal DOM functions
     */
    _renderGrid() {
        this.el.style.height = `${(this.settings.nNotes) * this.rowHeightPx}px`;
    }

    _renderNotes(notes) {
        notes.forEach(newNote => {
            let result = document.getElementById(newNote.id);
            if(! result) {
                result = this._createNoteElement(newNote);
                this.el.appendChild(result);
            }
            this._renderNotePosition(result, newNote);
            this._setWidth(result, this._beatsToPx(newNote.end - newNote.start));
        });
    }

    _createNoteElement(note) {
        let el = document.createElement('div');
        el.classList.add('piano-roll__note');
        el.id = note.id;
        el.noteID = note.id;

        return el;
    }

    _renderNotePosition(el, note) {
        this._renderXPosition(el, this._beatsToPercent(note.start));
        this._renderYPosition(el, (this.settings.nNotes - note.note) * this.rowHeightPx);
    }

    _renderXPosition(el, position) {
        el.style.left = `${position}%` || el.style.left;
    }

    _renderYPosition(el, position) {
        el.style.top = `${position}px`;
    }

    _setWidth(el, width) {
        el.style.width = `${this._pxToPercent(width)}%` || el.style.width;
    }

    /**
     * Helper functions
     */
    _pxToBeats(px) {
        return px / this.el.offsetWidth * this.settings.nBeatsInSequence;
    }

    _beatsToPercent(beats) {
        return beats / this.settings.nBeatsInSequence * 100;
    }

    _beatsToPx(beats) {
        return beats / this.settings.nBeatsInSequence * this.el.offsetWidth;
    }

    _pxToPercent(px) {
        return px / this.el.offsetWidth * 100;
    }
}

window.PianoRollNotes = PianoRollNotes;