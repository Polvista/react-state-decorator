import {globalState} from '../globalState';
import {isUntrackable, addHiddenProp, isCollection, isGlobalObject} from '../utils';

const untrackableProp = '__$untrackable';

export function markedUntrackable(target) {
    return target[untrackableProp] === true;
}

export function untracked(arg) {
    // TODO how to check that it is not user class instance?...
    if(typeof arg === 'function' && !isGlobalObject(arg) && !isCollection(arg)) {
        globalState.startedUntrackedActions++;
        try {
            return arg.apply(this, arguments);
        } finally {
            globalState.startedUntrackedActions--;
        }
    } else if(!isUntrackable(arg)) {
        // better just mark object than store a reference. GC should work
        addHiddenProp(arg, untrackableProp, true);
    }

    return arg;
}