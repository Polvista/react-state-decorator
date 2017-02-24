import {getTracker} from '../tracker';
import {defineProp, getOwnPropertyNames} from '../utils';

export function extend(target, obj) {
    const tracker = getTracker(target);
    if(!tracker) {
        console.error('Incorrect call extend - object cannot be tracked:', target);
        throw new Error('Incorrect call extend');
    }

    getOwnPropertyNames(obj).forEach(prop => {
        tracker.initValue(prop, obj[prop]);
        defineProp(target, prop, {
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