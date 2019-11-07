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
            self.renderNotes();
        });

        sequencer.store.notes.bus.subscribe('item:set', (prop, val) => {
            self.renderNotes();
        });

        /**
         * Remove stray resize handlers.
         */
        document.addEventListener('mouseup', this._onGlobalMouseup.bind(this));
    }

    interfaceHandlers = {
        '.piano-roll__note:mousedown': this._onNoteMousedown,
        '.piano-roll__notes:click': this._onGridClick
    }

    /**
     * Interface Event Handlers
     */
    _onNoteMousedown(e, el) {

        e.preventDefault();

        let note = sequencer.store.notes.find(+el.id).clone(),
            handler = this._onNoteMove = this._onNoteMove.bind(this);

        note.el = el;

        sequencer.store.selection.clear().push(note);

        this.lastCursorPositionX = e.pageX;
        this.lastCursorPositionY = e.pageY;

        if(e.offsetX < this.dragThresholdPx) {
            handler = this.onNoteResizeLeft = this.onNoteResizeLeft.bind(this);
            this.currentAction = 'notes:resize';
        }

        if(e.offsetX > el.offsetWidth - this.dragThresholdPx) {
            handler = this._onNoteResizeRight = this._onNoteResizeRight.bind(this);
            this.currentAction = 'notes:resize';
        }

        document.addEventListener('mousemove', handler, false);
        this.currentAction = 'notes:move';
    }

    _onNoteMove(e) {
        let noteOffset = -Math.floor((this._dragY(e) + this.rowHeightPx / 2) / this.rowHeightPx),
            noteOffsetBeats = this._pxToBeats(this._dragX(e));

        sequencer.store.selection.each(note => {
            note.start = noteOffsetBeats + note.last('start');
            note.end = note.last('end') - note.last('start') + note.start;
            note.note = note.last('note') + noteOffset;

            this._renderNotePosition(note.el, note.start, note.note);
        });
    }

    _onNoteResizeLeft(e) {
        sequencer.store.selection.each(note => {
            note.start = note.last('start') + this._pxToBeats(_this.dragX(e));
            this._renderXPosition(note.el, this._beatsToPercent(note.start));
            this._renderWidth(note.el, this._beatsToPercent(note.end - note.start));
        });
    }

    _onNoteResizeRight(e) {
        sequencer.store.selection.each(note => {
            note.end = note.last('end') + this._pxToBeats(_this.dragX(e));
            this._renderWidth(note.el, this._beatsToPercent(note.end - note.start));
        });
    }

    _onGridClick(e) {
        sequencer.store.selection.clear();
    }

    _onGlobalMouseup(e) {
        if('notes:resize, notes:move'.includes(this.currentAction)) {
            sequencer.store.selection.each(item => {
                item.cache();
                sequencer.store.notes.find(item.id).set(item.properties);
            });

            this.currentAction = undefined;
        }

        document.removeEventListener('mousemove', this.onNoteResizeLeft, false);
        document.removeEventListener('mousemove', this._onNoteResizeRight, false);
        document.removeEventListener('mousemove', this._onNoteMove, false);
    }

    /**
     * Render functions
     */
    renderGrid() {
        this.el.style.height = `${(sequencer.store.nNotes) * this.rowHeightPx}px`;
    }

    renderNotes() {
        sequencer.store.notes.each(newNote => {
            let result = document.getElementById(newNote.id);
            if(! result) {
                result = this._createNoteElement(newNote);
                this.el.appendChild(result);
            }
            this._renderNotePosition(result, newNote.start, newNote.note);
            this._renderWidth(result, this._beatsToPercent(newNote.end - newNote.start));
        });
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

    _createNoteElement(note) {
        let el = document.createElement('div');
        el.classList.add('piano-roll__note');
        el.id = note.id;
        el.noteID = note.id;

        return el;
    }

    _dragY(e) {
        return e.pageY - this.lastCursorPositionY;
    }

    _dragX(e) {
        return e.pageX - this.lastCursorPositionX;
    }
}

window.PianoRollNotes = PianoRollNotes;