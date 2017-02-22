import {getTracker} from '../tracker';

export function extend(target, obj) {
    const tracker = getTracker(target);
    if(!tracker) {
        console.error('Incorrect call extend - object cannot be tracked:', target);
        throw new Error('Incorrect call extend');
    }

    Object.getOwnPropertyNames(obj).forEach(prop => {
        tracker.initValue(prop, obj[prop]);
        Object.defineProperty(target, prop, {
            enumerable: true,
            configurable: true,
            get() {
                return tracker.getValue(prop);
            },
            set(value) {
                tracker.setValue(prop, value);
            }
        });
    });


    tracker.reportChange();

    return target;
}