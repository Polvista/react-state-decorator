import classPropertyDecorator from './classPropertyDecorator';
import {getTracker, makeTrackable} from './tracker';

export function track(target, propertyName, descriptor) {

    function initialize(instance, initialValue) {
        const tracker = getTracker(instance);
        tracker.initValue(propertyName, initialValue);

        // TODO one callback
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