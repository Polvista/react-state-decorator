import {globalState} from './globalState';

export function action(func) {
    if(!func)
        throw new Error('Provide function for action()');

    return function() {
        globalState.startedActions++;

        try {
            return func.apply(this, arguments);
        } finally {
            globalState.startedActions--;
            if(0 === globalState.startedActions) {
                globalState.afterActionsEndedCallbacks.forEach(cb => cb());
                globalState.afterActionsEndedCallbacks = [];
            }
        }
    }
}