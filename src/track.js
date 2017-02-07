import classPropertyDecorator from './classPropertyDecorator';
import {getOrCreateTracker, getTracker} from './tracker';

export function track(target, propertyName, descriptor) {

    function initialize(instance, initialValue) {
        const tracker = getOrCreateTracker(instance);
        tracker.values[propertyName] = initialValue;
    }

    function get() {
        const tracker = getTracker(this);
        return tracker.values[propertyName];
    }

    function set(val) {
        const tracker = getTracker(this);
        const isSame = tracker.values[propertyName] === val;
        tracker.values[propertyName] = val;
        !isSame && this.forceUpdate();
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