let service = new NoteService();
let store = sequencer.store;

class PianoRollNotes extends View
{
    dragThresholdPx = 8;
    rowHeightPx = 15;
    selectedClass = 'is-selected';

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
        document.addEventListener('keydown', this._onGlobalKeydown.bind(this));
        
    }

    interfaceHandlers = {
        '.piano-roll__note:mousedown': this._onNoteMousedown,
        '.piano-roll__notes:mousedown': this._onGridMousedown
    }

    /**
     * Interface Event Handlers
     */
    _onNoteMousedown(e, el) {

        e.preventDefault();

        if(service.selection().size() <= 1) {
            service.clearSelection();
            service.setSelection(+el.id);
        }

        if(e.offsetX < this.dragThresholdPx) {
            this._handleNoteResizeLeft(e);
            return;
        }

        if(e.offsetX > el.offsetWidth - this.dragThresholdPx) {
            this._handleNoteResizeRight(e);
            return;
        }

        this._handleNoteMove(e);
    }

    _handleNoteMove(clickEvent) {

        let self = this;

        helpers.onDrag(function(e, x, y) {
            let noteOffset = -Math.floor((y + self.rowHeightPx / 2) / self.rowHeightPx),
                noteOffsetBeats = self._pxToBeats(x);

            service.selection().each(note => {
                service.update(note.id, {
                    start: noteOffsetBeats + note.last('start'),
                    note: note.last('note') + noteOffset
                });
            });
        }, function() {
            service.selection().each(item => {
                item.cache();
            });
        }, clickEvent);
    }

    _handleNoteResizeLeft(clickEvent) {

        let self = this;

        helpers.onDrag(function(e, x) {
            service.selection().each(note => {
                service.update(note.id, {
                    start: note.last('start') + self._pxToBeats(x),
                    duration: note.last('duration') - self._pxToBeats(x)
                });
            });
        }, function() {
            service.selection().each(item => {
                item.cache();
            });
        }, clickEvent);
    }

    _handleNoteResizeRight(clickEvent) {

        let self = this;

        helpers.onDrag(function(e, x) {
            service.selection().each(note => {
                service.update(note.id, {
                    duration: note.last('duration') + self._pxToBeats(x)
                });
            });
        }, function() {
            service.selection().each(item => {
                item.cache();
            });
        }, clickEvent);
    }

    _onGridMousedown(clickEvent) {

        clickEvent.preventDefault();

        // if(service.selection().size() === 0) {
            
        //     return service.create({
        //         start: this._pxToBeats(clickEvent.pageX),
        //         note: this._noteAtYOffsetPx(clickEvent.offsetY),
        //         duration: store.division
        //     });
        // }
        service.clearSelection();

        let self = this;

        helpers.onDrag(function(e, x, y) {

            self._showDragOverlay();

            if(e.target.id == 'drag-overlay') {
                let rangeX = [
                    self._pxToBeats(e.pageX), 
                    self._pxToBeats(clickEvent.pageX)
                ].sort((a,b) => { return a - b });
        
                let rangeY = [
                    self._noteAtYOffsetPx(e.offsetY), 
                    self._noteAtYOffsetPx(clickEvent.offsetY)
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

                console.log(self._noteAtYOffsetPx(clickEvent.pageY));
        
                service.clearSelection();
                service.setSelection(selectedNotes);
            }

        }, function() {

            self._hideDragOverlay();

        }, clickEvent);
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