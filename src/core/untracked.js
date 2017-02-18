import {globalState} from '../globalState';

export function untracked(arg) {
    if(typeof arg === 'function') {
        return function() {
            globalState.startedUntrackedActions++;

            try {
                return arg.apply(this, arguments);
            } finally {
                globalState.startedUntrackedActions--;
            }
        }
    }
}