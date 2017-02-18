import {getTracker, isTracking} from '../tracker';

export function deleteTrackableProp(target, prop) {
    if(isTracking(target)) {
        const tracker = getTracker(target);
        tracker.deleteValue(prop);
        tracker.reportChange();
    }

    delete target[prop];
}