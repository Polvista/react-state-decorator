import classPropertyDecorator from './classPropertyDecorator';
import {getTracker} from './tracker';
import {globalState} from './globalState';
import {defineProp} from './utils';

function createTrackDecorator(scope) {
    return function(target, propertyName, descriptor) {

        function initialize(instance, initialValue) {
            const tracker = getTracker(instance);
            tracker.initValue(propertyName, initialValue);

            if(!tracker.isRerenderCallbackSetted()) {
                tracker.onChange(() => {
                    if(globalState.startedUntrackedActions > 0) {
                        return;
                    }

                    if(globalState.startedActions > 0) {
                        //TODO refactor to trackers have ids logic
                        if(!tracker.isWaitingForActionsToEnd()) {
                            tracker.setWaitingForActionsToEnd(true);
                            globalState.afterActionsEndedCallbacks.push(() => {
                                tracker.setWaitingForActionsToEnd(false);
                                instance.forceUpdate();
                            });
                        }

                        return;
                    }

                    // TODO track mount state
                    instance.forceUpdate();
                }, true);
            }

            defineProp(instance, propertyName, {
                configurable: true,
                enumerable: true,
                get,
                set
            });
        }

        function get() {
            return getTracker(this).getValue(propertyName);
        }

        function set(val) {
            getTracker(this).setValue(propertyName, val);
        }

        return classPropertyDecorator(
            target,
            propertyName,
            descriptor,
            initialize,
            get,
            set
        );
    }
}

const trackDecorator = createTrackDecorator();
trackDecorator.watchRef = createTrackDecorator('ref');
trackDecorator.watchShallow = createTrackDecorator('shallow');

export const track = trackDecorator;