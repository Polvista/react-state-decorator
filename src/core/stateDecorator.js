import {classPropertyDecorator, patchLifecycleMethods} from '../utils/decoratorUtils';
import {getTracker} from './tracker';
import {globalState} from './globalState';
import {defineProp} from '../utils/utils';

function createStateDecorator(scope) {
    return function(target, propertyName, descriptor) {

        patchLifecycleMethods(
            target,
            instance => getTracker(instance, true).setMounted(),
            instance => getTracker(instance, true).stopRerender()
        );

        function initialize(instance, initialValue) {
            const tracker = getTracker(instance, true);

            tracker.setPropScope(propertyName, scope);
            tracker.initValue(propertyName, initialValue);

            const rerenderComponent = () => {
                // component was not mounted, we are in constructor
                if(!tracker.isMounted)
                    return;

                instance.forceUpdate();
            };

            if(!tracker.isRerenderCallbackSetted()) {
                tracker.setRerenderCallback(() => {
                    if(globalState.startedUntrackedActions > 0) {
                        return;
                    }

                    if(globalState.startedActions > 0) {
                        //TODO refactor to trackers have ids logic
                        if(!tracker.isWaitingForActionsToEnd()) {
                            tracker.setWaitingForActionsToEnd(true);
                            globalState.afterActionsEndedCallbacks.push(() => {
                                tracker.setWaitingForActionsToEnd(false);
                                rerenderComponent();
                            });
                        }

                        return;
                    }

                    rerenderComponent();
                });
            }

            defineProp(instance, propertyName, {
                configurable: true,
                enumerable: true,
                get,
                set
            });
        }

        function get() {
            return getTracker(this, true).getValue(propertyName);
        }

        function set(val) {
            if(scope === 'shallow' && val != null && !(val instanceof Array)) {
                const err = 'Value for @state.watchShallow is not an array';
                console.error(err, val);
                throw new Error(err);
            }

            getTracker(this, true).setValue(propertyName, val);
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

const stateDecorator = createStateDecorator();
stateDecorator.watchRef = createStateDecorator('ref');
stateDecorator.watchShallow = createStateDecorator('shallow');

export const state = stateDecorator;