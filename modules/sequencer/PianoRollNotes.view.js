/**
 * Controller logic
 * 
 * TODO: DELETE
 */
window.notes = [
    [2,2.25,127,127], [4,4.5,126,127], [3,3.75,125,127], [2,4,124,127]
];

window.notes = notes.map(n => {
    return new NoteModel({
        id: Date.now() + ~~((Math.random() * 1000) + 1),
        start: n[0],
        end: n[1],
        note: n[2],
        velocity: n[3]
    });
});

window.notes = new Collection(window.notes);


//////////////////



class PianoRollNotes extends View
{
    dragThresholdPx = 8;
    rowHeightPx = 15;

    currentSelection;
    lastCursorPositionY;
    lastCursorPositionX;
    isNoteMoving;
    currentAction;

    settings = {
        nBeatsInSequence: 16,
        nNotes: 128
    }

    constructor(selector)
    {
        super(selector);
        this._bindInterfaceHandlers();
        this._bindBusHandlers();

        this.currentSelection = new Collection();

        /**
         * Remove stray resize handlers.
         */
        document.addEventListener('mouseup', this.onGlobalMouseup.bind(this));

        this.render({
            notes: window.notes.all(),
            nBeatsInSequence: 16,
            nNotes: 128
        });
    }

    busHandlers = {
        'notes:move': this.onNotesMove
    }

    interfaceHandlers = {
        '.piano-roll__note:mousedown': this.onNoteMousedown,
        '.piano-roll__notes:click': this.onGridClick
    }

    /**
     * Bus Event Handlers
     */
    onNotesMove(payload) {
        payload.each(item => {
            let note = window.notes.find(item.id);
            Object.keys(note.properties).forEach(key => {
                note[key] = item.properties[key]
            });
        });

        // TODO: Update model in collection above, then here listen to collection events?
        this.render({
            notes: window.notes.all()
        });
    }

    /**
     * Interface Event Handlers
     */
    onNoteMousedown(e, el) {

        let note = window.notes.find(+el.id).clone();
        note.el = el;

        this.currentSelection.clear().push(note);

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
            noteOffset = -Math.floor((dragDistanceY + this.rowHeightPx / 2) / this.rowHeightPx);

        this.currentSelection.each(note => {
            // TODO: Only do this if values are different, expensive
            note.start = this._pxToBeats(dragDistanceX) + note.last('start');
            note.end = note.last('end') - note.last('start') + note.start;
            note.note = note.last('note') + noteOffset;
            
            this._renderNotePosition(note.el, note.start, note.note);
        });

        this.currentAction = 'notes:move';
    }

    onNoteResize(e) {

        // let offset = this._el.offset().left,
        //     attenuation = e.x - this.currentEl.cursorStartX;

        // if(this.currentEl.changeOffset) {
        //     this._renderXPosition(this.currentEl, e.x - offset);
        //     attenuation = -attenuation;
        // }

        // this._setWidth(this.currentEl, attenuation + this.currentEl.originalWidth);
        this.currentAction = 'notes:resize';
    }

    onGridClick(e) {
        this.currentSelection.clear();
    }

    onGlobalMouseup(e) {
        if(this.currentAction == 'notes:resize' || this.currentAction == 'notes:move') {

            this.currentSelection.each(selection => {
                selection.cache();
            });

            this.bus.publish(this.currentAction, this.currentSelection);

            this.currentAction = undefined;
        }

        document.removeEventListener('mousemove', this.onNoteResize, false);
        document.removeEventListener('mousemove', this.onNoteMove, false);
    }

    /**
     * DOM Functions
     * 
     * Take an array of settings and update the DOM if necessary
     * 
     * @param {array} notes 
     */
    render(settings) {

        // TODO: Move to another view?
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
            this._renderNotePosition(result, newNote.start, newNote.note);
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

    _renderNotePosition(el, start, note) {
        this._renderXPosition(el, this._beatsToPercent(start));
        this._renderYPosition(el, (this.settings.nNotes - note - 1) * this.rowHeightPx);
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