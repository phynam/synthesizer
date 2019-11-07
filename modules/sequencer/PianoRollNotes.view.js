class PianoRollNotes extends View
{
    dragThresholdPx = 8;
    rowHeightPx = 15;

    lastCursorPositionY;
    lastCursorPositionX;
    currentAction;

    constructor(selector)
    {
        super(selector);

        this._bindInterfaceHandlers();
        this._bindBusHandlers();

        let self = this;

        sequencer.store.notes.bus.subscribe('set', () => {
            self.render();
        });

        sequencer.store.notes.bus.subscribe('item:set', (prop, val) => {
            self.render();
        });

        /**
         * Remove stray resize handlers.
         */
        document.addEventListener('mouseup', this.onGlobalMouseup.bind(this));
    }

    interfaceHandlers = {
        '.piano-roll__note:mousedown': this.onNoteMousedown,
        '.piano-roll__notes:click': this.onGridClick
    }

    /**
     * Interface Event Handlers
     */
    onNoteMousedown(e, el) {

        e.preventDefault();

        let note = sequencer.store.notes.find(+el.id).clone(),
            handler = this.onNoteMove = this.onNoteMove.bind(this);

        note.el = el;

        sequencer.store.selection.clear().push(note);

        this.lastCursorPositionX = e.pageX;
        this.lastCursorPositionY = e.pageY;

        if(e.offsetX < this.dragThresholdPx) {
            handler = this.onNoteResizeLeft = this.onNoteResizeLeft.bind(this);
        }

        if(e.offsetX > el.offsetWidth - this.dragThresholdPx) {
            handler = this.onNoteResizeRight = this.onNoteResizeRight.bind(this);
        }

        document.addEventListener('mousemove', handler, false);
    }

    onNoteMove(e) {
        let dragDistanceX = e.pageX - this.lastCursorPositionX,
            dragDistanceY = e.pageY - this.lastCursorPositionY,
            noteOffset = -Math.floor((dragDistanceY + this.rowHeightPx / 2) / this.rowHeightPx),
            noteOffsetBeats = this._pxToBeats(dragDistanceX);

        sequencer.store.selection.each(note => {
            note.start = noteOffsetBeats + note.last('start');
            note.end = note.last('end') - note.last('start') + note.start;
            note.note = note.last('note') + noteOffset;

            this._renderNotePosition(note.el, note.start, note.note);
        });

        this.currentAction = 'notes:move';
    }

    onNoteResizeLeft(e) {

        let dragDistance = this._pxToBeats(e.pageX - this.lastCursorPositionX);

        sequencer.store.selection.each(note => {
            note.start = note.last('start') + dragDistance;
            this._renderXPosition(note.el, this._beatsToPercent(note.start));
            this._renderWidth(note.el, this._beatsToPercent(note.end - note.start));
        });

        this.currentAction = 'notes:resize';
    }

    onNoteResizeRight(e) {

        let dragDistance = this._pxToBeats(e.pageX - this.lastCursorPositionX);

        sequencer.store.selection.each(note => {
            note.end = note.last('end') + dragDistance;
            this._renderWidth(note.el, this._beatsToPercent(note.end - note.start));
        });

        this.currentAction = 'notes:resize';
    }

    onGridClick(e) {
        sequencer.store.selection.clear();
    }

    onGlobalMouseup(e) {
        if('notes:resize, notes:move'.includes(this.currentAction)) {
            sequencer.store.selection.each(item => {
                item.cache();
                sequencer.store.notes.find(item.id).set(item.properties);
            });

            this.currentAction = undefined;
        }

        document.removeEventListener('mousemove', this.onNoteResizeLeft, false);
        document.removeEventListener('mousemove', this.onNoteResizeRight, false);
        document.removeEventListener('mousemove', this.onNoteMove, false);
    }

    /**
     * DOM Functions
     * 
     * Take an array of settings and update the DOM if necessary
     */
    render() {

        // TODO: Move to another view?
        if(sequencer.store.nBeatsInSequence) {
            sequencer.store.nBeatsInSequence = sequencer.store.nBeatsInSequence;
            this._renderGrid();
        }

        if(sequencer.store.nNotes) {
            sequencer.store.nNotes = sequencer.store.nNotes;
            this._renderGrid();
        }

        if(sequencer.store.notes.size) {
            this._renderNotes(sequencer.store.notes);
        }
    }

    /**
     * Internal DOM functions
     */
    _renderGrid() {
        this.el.style.height = `${(sequencer.store.nNotes) * this.rowHeightPx}px`;
    }

    _renderNotes(notes) {
        notes.each(newNote => {
            let result = document.getElementById(newNote.id);
            if(! result) {
                result = this._createNoteElement(newNote);
                this.el.appendChild(result);
            }
            this._renderNotePosition(result, newNote.start, newNote.note);
            this._renderWidth(result, this._beatsToPercent(newNote.end - newNote.start));
        });
    }

    _createNoteElement(note) {
        let el = document.createElement('div');
        el.classList.add('piano-roll__note');
        el.id = note.id;
        el.noteID = note.id;

        return el;
    }

    _renderNotePosition(el, start, note) {
        this._renderXPosition(el, this._beatsToPercent(start));
        this._renderYPosition(el, (sequencer.store.nNotes - note - 1) * this.rowHeightPx);
    }

    _renderXPosition(el, position) {
        el.style.left = `${position}%` || el.style.left;
    }

    _renderYPosition(el, position) {
        el.style.top = `${position}px`;
    }

    _renderWidth(el, width) {
        el.style.width = `${width}%` || el.style.width;
    }

    /**
     * Helper functions
     */
    _pxToBeats(px) {
        return px / this.el.offsetWidth * sequencer.store.nBeatsInSequence;
    }

    _beatsToPercent(beats) {
        return beats / sequencer.store.nBeatsInSequence * 100;
    }

    _beatsToPx(beats) {
        return beats / sequencer.store.nBeatsInSequence * this.el.offsetWidth;
    }

    _pxToPercent(px) {
        return px / this.el.offsetWidth * 100;
    }
}

window.PianoRollNotes = PianoRollNotes;