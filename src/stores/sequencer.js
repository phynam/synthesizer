// TODO create store class?
import {Model} from 'base/Model';

const sequencer = new Model({
    nBeatsInSequence: 16,
    nNotes: 128,
    division: 0.25
});

export {sequencer};