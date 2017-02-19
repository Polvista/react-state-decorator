import {getTracker} from '../tracker';

// TODO extend
export function addTrackableProp(target, prop, value) {
    const tracker = getTracker(target);

    if(!tracker) {
        console.error('Incorrect call addTrackableProp - object cannot be tracked:', target);
        throw new Error('Incorrect call addTrackableProp');
    }

    tracker.initValue(prop, value);
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
    tracker.reportChange();

}