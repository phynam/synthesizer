class PianoRollNotes extends View
{
    dragThresholdPx = 8;
    rowHeightPx = 15;
    selectedClass = 'is-selected';
    isNoteDragging = false;
    isSelectionDragging = false;

    lastCursorPositionY;
    lastCursorPositionX;

    constructor(selector)
    {
        super(selector);

        this._bindInterfaceHandlers();
        this._bindBusHandlers();

        sequencer.store.notes.subscribe('set', () => {
            this.renderNotes();
        });

        sequencer.store.notes.subscribe('item:update', () => {
            this.renderNotes();
        });

        sequencer.store.notes.subscribe('push', (note) => {
            this.renderNotes();
        });

        sequencer.store.notes.subscribe('remove', (note) => {
            this.renderNotes(true);
        });

        sequencer.store.selection.subscribe('item:update', (updates, note) => {
            if(updates.note >= 0) {
                this._renderNoteInRow(note.el, updates.note);
            }

            if(updates.start >= 0 || updates.end) {
                this._renderWidth(note.el, this._beatsToPercent(note.end - note.start));

                if(updates.start >= 0) {
                    this._renderXPosition(note.el, this._beatsToPercent(updates.start));
                }
            }
        });

        sequencer.store.selection.subscribe('push', (note) => {
            note.el.classList.add(this.selectedClass);
        });

        sequencer.store.selection.subscribe('clear', (notes) => {
            if(notes.length) {
                notes.forEach(note => {
                    note.el.classList.remove(this.selectedClass);
                });
            }
        });

        /**
         * Global handlers
         */
        document.addEventListener('mouseup', this._onGlobalMouseup.bind(this));
        document.addEventListener('keydown', this._onGlobalKeydown.bind(this));
        
    }

    interfaceHandlers = {
        '.piano-roll__note:mousedown': this._onNoteMousedown,
        '.piano-roll__notes:mousedown': this._onGridMousedown,
        '.piano-roll__notes:mouseup': this._onGridMouseup
    }

    /**
     * Interface Event Handlers
     */
    _onNoteMousedown(e, el) {

        e.preventDefault();

        let note = sequencer.store.notes.find(+el.id).clone(),
            handler = this._onNoteMove = this._onNoteMove.bind(this);

        sequencer.store.selection.clear().push(note);

        this.lastCursorPositionX = e.pageX;
        this.lastCursorPositionY = e.pageY;

        if(e.offsetX < this.dragThresholdPx) {
            handler = this._onNoteResizeLeft = this._onNoteResizeLeft.bind(this);
        }

        if(e.offsetX > el.offsetWidth - this.dragThresholdPx) {
            handler = this._onNoteResizeRight = this._onNoteResizeRight.bind(this);
        }

        document.addEventListener('mousemove', handler, false);
        this.isNoteDragging = true;
    }

    _onNoteMove(e) {
        let noteOffset = -Math.floor((this._dragY(e) + this.rowHeightPx / 2) / this.rowHeightPx),
            noteOffsetBeats = this._pxToBeats(this._dragX(e));

        sequencer.store.selection.each(note => {
            note.update({
                start: noteOffsetBeats + note.last('start'),
                end: note.last('end') - note.last('start') + note.start,
                note: note.last('note') + noteOffset
            });
        });
    }

    _onNoteResizeLeft(e) {
        sequencer.store.selection.each(note => {
            note.update({
                start: note.last('start') + this._pxToBeats(this._dragX(e))
            });
        });
    }

    _onNoteResizeRight(e) {
        sequencer.store.selection.each(note => {
            note.update({
                end: note.last('end') + this._pxToBeats(this._dragX(e))
            });
        });
    }

    _onGridMousedown(e) {
        let handler = this._onSelectionDrag = this._onSelectionDrag.bind(this);

        this.lastCursorPositionX = e.pageX;
        this.lastCursorPositionY = e.pageY;

        document.addEventListener('mousemove', handler, false);
    }

    _onSelectionDrag(e) {

        let rangeX = [this._pxToBeats(e.pageX), this._pxToBeats(this.lastCursorPositionX)].sort();
        let selectedNotes = sequencer.store.notes.where(note => {
            return (note.start >= rangeX[0] && note.start < rangeX[1]) || (note.end >= rangeX[0] && note.end < rangeX[1]);
        });

        sequencer.store.selection.clear();

        if(rangeX[0] !== rangeX[1]) {
            this.isSelectionDragging = true;

            selectedNotes.forEach(note => {
                sequencer.store.selection.push(note.clone());
            });
        }
    }

    _onGridMouseup(e) {
        if(!this.isSelectionDragging) {
            sequencer.store.notes.push(new NoteModel({
                start: this._pxToBeats(e.pageX),
                note: this._noteAtYOffset(e.offsetY),
                end: this._pxToBeats(e.pageX) + 1 // TODO: Use default
            }));
        }
    }

    _onGlobalMouseup(e) {
        if(this.isNoteDragging) {
            sequencer.store.selection.each(item => {
                sequencer.store.notes.find(item.id).update(item.properties, true);
            });

            this.isNoteDragging = false;
        }

        if(this.isSelectionDragging) {
            this.isSelectionDragging = false;
        }

        document.removeEventListener('mousemove', this._onNoteResizeLeft, false);
        document.removeEventListener('mousemove', this._onNoteResizeRight, false);
        document.removeEventListener('mousemove', this._onNoteMove, false);
        document.removeEventListener('mousemove', this._onSelectionDrag, false);
    }

    _onGlobalKeydown(e) {
        let key = event.keyCode;

        /**
         * Delete
         */
        if(key === 8 || key === 46) {
            sequencer.store.selection.each(item => {
                sequencer.store.notes.remove(item.id);
            });
            sequencer.store.selection.clear();
        }
    }

    /**
     * Render functions
     */
    renderGrid() {
        this.el.style.height = `${(sequencer.store.nNotes) * this.rowHeightPx}px`;
    }

    renderNotes(hard = false) {

        if(hard) {
            this.el.innerHTML = '';
        }

        sequencer.store.notes.each(newNote => {
            let result = document.getElementById(newNote.id);
            if(! result || hard) {
                result = this._createNoteElement(newNote);
                this.el.appendChild(result);
            }
            this._renderXPosition(result, this._beatsToPercent(newNote.start));
            this._renderNoteInRow(result, newNote.note);
            this._renderWidth(result, this._beatsToPercent(newNote.end - newNote.start));
        });
    }

    _renderNoteInRow(el, note) {
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

    _noteAtYOffset(offset) {
        return sequencer.store.nNotes - 1 - Math.floor(offset / this.rowHeightPx);
    }
}