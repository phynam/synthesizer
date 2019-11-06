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
    currentAction;

    // TODO: Move to some global singleton
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
        'notes:move': payload => {
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
        },
        'notes:resize': payload => {
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

        let note = window.notes.find(+el.id).clone(),
            handler = this.onNoteMove = this.onNoteMove.bind(this);

        note.el = el;

        this.currentSelection.clear().push(note);

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

        this.currentSelection.each(note => {
            note.start = noteOffsetBeats + note.last('start');
            note.end = note.last('end') - note.last('start') + note.start;
            note.note = note.last('note') + noteOffset;

            this._renderNotePosition(note.el, note.start, note.note);
        });

        this.currentAction = 'notes:move';
    }

    onNoteResizeLeft(e) {

        let dragDistance = this._pxToBeats(e.pageX - this.lastCursorPositionX);

        this.currentSelection.each(note => {
            note.start = note.last('start') + dragDistance;
            this._renderXPosition(note.el, this._beatsToPercent(note.start));
            this._renderWidth(note.el, this._beatsToPercent(note.end - note.start));
        });

        this.currentAction = 'notes:resize';
    }

    onNoteResizeRight(e) {

        let dragDistance = this._pxToBeats(e.pageX - this.lastCursorPositionX);

        this.currentSelection.each(note => {
            note.end = note.last('end') + dragDistance;
            this._renderWidth(note.el, this._beatsToPercent(note.end - note.start));
        });

        this.currentAction = 'notes:resize';
    }

    onGridClick(e) {
        this.currentSelection.clear();
    }

    onGlobalMouseup(e) {
        if(['notes:resize', 'notes:move'].includes(this.currentAction)) {

            this.currentSelection.each(selection => {
                selection.cache();
            });

            this.bus.publish(this.currentAction, this.currentSelection);

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
        this._renderYPosition(el, (this.settings.nNotes - note - 1) * this.rowHeightPx);
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