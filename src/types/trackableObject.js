import {getTracker} from '../tracker';

export function getTrackableObject(target) {
    const tracker = getTracker(target);

    Object.getOwnPropertyNames(target).forEach(propName => {
        const descriptor = Object.getOwnPropertyDescriptor(target, propName);
        if(!descriptor || descriptor.writable === false || descriptor.configurable === false) {
            return;
        }

        tracker.initValue(propName, target[propName]);

        //TODO existing get/set ?
        Object.defineProperty(target, propName, {
            enumerable: descriptor.enumerable,
            configurable: true,
            get() {
                return tracker.getValue(propName);
            },
            set(value) {
                tracker.setValue(propName, value);
            }
        });
    });

    return target;
}