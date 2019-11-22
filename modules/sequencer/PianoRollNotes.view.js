let service = new NoteService();
let store = sequencer.store;

class PianoRollNotes extends View
{
    dragThresholdPx = 8;
    rowHeightPx = 15;
    selectedClass = 'is-selected';
    isNoteDragging = false;
    isSelectionDragging = false;

    lastCursorPositionY;
    lastCursorPositionX;
    lastCursorOffsetY;

    constructor(selector)
    {
        super(selector);

        this._bindInterfaceHandlers();
        this._bindBusHandlers();

        store.notes.subscribe('item:update', (updates, note) => {
            if(typeof updates.note !== 'undefined') {
                this._renderNoteInRow(note.el, updates.note);
            }

            if(typeof updates.duration !== 'undefined') {
                this._renderWidth(note.el, this._beatsToPercent(note.duration));
            }

            if(typeof updates.start !== 'undefined') {
                this._renderXPosition(note.el, this._beatsToPercent(updates.start));
            }
        });

        store.notes.subscribe('push', () => {
            this.renderNotes();
        });

        store.notes.subscribe('set remove', () => {
            this.renderNotes(true);
        });

        store.selection.subscribe('set', () => {
            service.selection().each(note => {
                note.el.classList.add(this.selectedClass);
            });
        });

        store.selection.subscribe('clear', () => {
            service.selection().each(note => {
                note.el.classList.remove(this.selectedClass);
            });
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

        let handler = this._onNoteMove = this._onNoteMove.bind(this);

        if(service.selection().size() <= 1) {
            service.clearSelection();
            service.setSelection(+el.id);
        }

        this.lastCursorPositionX = e.pageX;
        this.lastCursorPositionY = e.pageY;

        if(e.offsetX < this.dragThresholdPx) {
            handler = this._onNoteResizeLeft = this._onNoteResizeLeft.bind(this);
        }

        if(e.offsetX > el.offsetWidth - this.dragThresholdPx) {
            handler = this._onNoteResizeRight = this._onNoteResizeRight.bind(this);
        }

        this.isNoteDragging = true;
        document.addEventListener('mousemove', handler, false);
    }

    _onNoteMove(e) {
        let noteOffset = -Math.floor((this._dragY(e) + this.rowHeightPx / 2) / this.rowHeightPx),
            noteOffsetBeats = this._pxToBeats(this._dragX(e));

        service.selection().each(note => {
            service.update(note.id, {
                start: noteOffsetBeats + note.last('start'),
                note: note.last('note') + noteOffset
            });
        });
    }

    _onNoteResizeLeft(e) {
        service.selection().each(note => {
            service.update(note.id, {
                start: note.last('start') + this._pxToBeats(this._dragX(e)),
                duration: note.last('duration') - this._pxToBeats(this._dragX(e))
            });
        });
    }

    _onNoteResizeRight(e) {
        service.selection().each(note => {
            service.update(note.id, {
                duration: note.last('duration') + this._pxToBeats(this._dragX(e))
            });
        });
    }

    _onGridMousedown(e) {

        e.preventDefault();

        let handler = this._onSelectionDrag = this._onSelectionDrag.bind(this);

        this.lastCursorPositionX = e.pageX;
        this.lastCursorPositionY = e.pageY;
        this.lastCursorOffsetY = e.offsetY;

        document.addEventListener('mousemove', handler, false);
    }

    _onSelectionDrag(e) {

        this._showDragOverlay();

        if(e.target.id == 'drag-overlay') {
            let rangeX = [
                this._pxToBeats(e.pageX), 
                this._pxToBeats(this.lastCursorPositionX)
            ].sort((a,b) => { return a - b });
    
            let rangeY = [
                this._noteAtYOffsetPx(e.offsetY), 
                this._noteAtYOffsetPx(this.lastCursorOffsetY)
            ].sort((a,b) => { return a - b });
    
            let selectedNotes = store.notes.where(note => {
                let end = note.start + note.duration;

                if(note.note >= rangeY[0] && note.note <= rangeY[1]) {
                    if(rangeX[0] >= note.start || rangeX[1] >= note.start) {
                        if(rangeX[0] < end || rangeX[1] < end) {
                            return true;
                        }
                    }
                }
            }).map(n => { return n.id });
    
            this.isSelectionDragging = true;
            service.clearSelection();
            service.setSelection(selectedNotes);
        }
    }

    _onGridMouseup(e) {
        if(!this.isSelectionDragging) {
            if(service.selection().size() === 0) {
                service.create({
                    start: this._pxToBeats(e.pageX),
                    note: this._noteAtYOffsetPx(e.offsetY),
                    duration: store.division
                });
            }
            
            service.clearSelection();
        }
    }

    _onGlobalMouseup(e) {
        if(this.isNoteDragging) {
            service.selection().each(item => {
                item.cache();
            });

            this.isNoteDragging = false;
        }

        if(this.isSelectionDragging) {
            this.isSelectionDragging = false;
        }

        this._hideDragOverlay();
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
            service.selection().each(item => {
                store.notes.remove(item.id);
            });
            service.selection().clear();
        }
    }

    /**
     * Render functions
     */
    // TODO: Move to grid view
    renderGrid() {
        _('.piano-roll__grid').first().style.height = `${(store.nNotes) * this.rowHeightPx}px`;
    }

    renderNotes(hard = false) {

        if(hard) {
            this.el.innerHTML = '';
        }

        store.notes.each(newNote => {
            let result = document.getElementById(newNote.id);
            if(! result || hard) {
                result = this._createNoteElement(newNote);
                this.el.appendChild(result);
            }
            this._renderXPosition(result, this._beatsToPercent(newNote.start));
            this._renderNoteInRow(result, newNote.note);
            this._renderWidth(result, this._beatsToPercent(newNote.duration));
        });
    }

    _renderNoteInRow(el, note) {
        this._renderYPosition(el, (store.nNotes - note) * this.rowHeightPx);
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
        return px / this.el.offsetWidth * store.nBeatsInSequence;
    }

    _beatsToPercent(beats) {
        return beats / store.nBeatsInSequence * 100;
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

    _noteAtYOffsetPx(offset) {
        return store.nNotes - Math.floor(offset / this.rowHeightPx);
    }

    _showDragOverlay() {
        document.getElementById('drag-overlay').classList.add('is-active');
    }

    _hideDragOverlay() {
        document.getElementById('drag-overlay').classList.remove('is-active');
    }
}