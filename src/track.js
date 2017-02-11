import classPropertyDecorator from './classPropertyDecorator';
import {getTracker, makeTrackable} from './tracker';

export function track(target, propertyName, descriptor) {

    function initialize(instance, initialValue) {
        const tracker = getTracker(instance);
        const {tracker: valueTracker} = makeTrackable(initialValue);

        if(valueTracker) {
            valueTracker.notifyAboutChanges(tracker);
        }

        tracker.initValue(propertyName, initialValue);
        tracker.onChange(() => {
            // TODO track mount state
            instance.forceUpdate();
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
        set,
    );
}