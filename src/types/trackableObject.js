import {getTracker} from '../core/tracker';
import {defineProp, getOwnPropertyNames} from '../utils/utils';

export function getTrackableObject(target) {
    const tracker = getTracker(target);

    getOwnPropertyNames(target).forEach(propName => {
        const descriptor = Object.getOwnPropertyDescriptor(target, propName);
        if(!descriptor || descriptor.writable === false || descriptor.configurable === false) {
            return;
        }

        tracker.initValue(propName, target[propName]);

        //TODO existing get/set ?
        defineProp(target, propName, {
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