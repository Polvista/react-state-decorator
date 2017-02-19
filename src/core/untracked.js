import {globalState} from '../globalState';
import {isUntrackable, addHiddenProp} from '../utils';

const untrackableProp = '__$untrackable';

export function markedUntrackable(target) {
    return target[untrackableProp] === true;
}

export function untracked(arg) {
    // TODO Maps, Promises, etc checks
    if(typeof arg === 'function') {
        return function() {
            globalState.startedUntrackedActions++;
            try {
                return arg.apply(this, arguments);
            } finally {
                globalState.startedUntrackedActions--;
            }
        }
    } else if(!isUntrackable(arg)) {
        // better just mark object than store a reference. GC should work
        addHiddenProp(arg, untrackableProp, true);
    }

    return arg;
}