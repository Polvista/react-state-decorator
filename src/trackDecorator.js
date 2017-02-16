import classPropertyDecorator from './classPropertyDecorator';
import {getTracker} from './tracker';

export function track(target, propertyName, descriptor) {

    function initialize(instance, initialValue) {
        const tracker = getTracker(instance);
        tracker.initValue(propertyName, initialValue);

        if(!tracker.isRerenderCallbackSetted()) {
            tracker.onChange(() => {
                // TODO track mount state
                instance.forceUpdate();
            }, true);
        }

        Object.defineProperty(instance, propertyName, {
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
        set,
    );
}