import {Collection} from 'base/Collection';

class NoteCollection extends Collection {

    whereWithinRange(start, end, noteStart, noteEnd) {
        return this.where(note => {
            if(note.note >= noteStart && note.note <= noteEnd) {
                if(start >= note.start || end >= note.start) {
                    if(start < note.end || end < note.end) {
                        return true;
                    }
                }
            }
        });
    }
}

export {NoteCollection};