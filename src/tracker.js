import {getTrackableArray} from './trackableArray';
import {addHiddenFinalProp, isPrimitive, isPlainObject, isUnique, isArray} from './utils';

const trackerProp = '__$tracker';

export function getTracker(instance) {
    //runLazyInitializers(instance); // not sure about this

    if(isPrimitive(instance))
        return;

    if(instance[trackerProp])
        return instance[trackerProp];

    const tracker = new Tracker();
    addHiddenFinalProp(instance, trackerProp, tracker);

    return tracker;
}

export function makeTrackable(target) {
    if(isPrimitive(target)) {
        //TODO may be  change to return target?
        return {
            value: target
        };
    }

    if(isTracking(target)) {
        return {
            tracker: getTracker(target),
            value: target
        };
    }

    if(isPlainObject(target)) {
        const tracker = getTracker(target);

        Object.getOwnPropertyNames(target).forEach(propName => {
            const descriptor = Object.getOwnPropertyDescriptor(target, propName);
            if(!descriptor || descriptor.writable === false || descriptor.configurable === false) {
                return;
            }

            const {
                tracker: propTracker,
                value: propValue
            } = makeTrackable(target[propName]);

            tracker.initValue(propName, propValue);

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

            if(propTracker) {
                propTracker.notifyAboutChanges(tracker);
            }
        });

        return {
            tracker,
            value: target
        };
    }

    if(isArray(target)) {
        const trackableArray = getTrackableArray(target);
        return {
            tracker: getTracker(trackableArray),
            value: trackableArray
        };
    }

    return {
        value: target
    };
}

export function isTracking(target) {
    return target[trackerProp] != null;
}

class Tracker {

    constructor() {
        this.values = {};
        this.callbacks = [];
        this.listeners = [];
    }

    setValue(prop, value) {
        const currValue = this.getValue(prop);
        const isSame = currValue === value;

        if(!isSame) {
            const {
                tracker: valueTracker,
                value: newValue
            } = makeTrackable(value);

            if(newValue)
                value = newValue;

            if(valueTracker)
                valueTracker.notifyAboutChanges(this);

            const currTracker = getTracker(currValue);
            if(currTracker)
                currTracker.stopListenChanges(this); //TODO test this
        }

        this.values[prop] = value;

        if(!isSame)
            this.reportChange();
    }

    initValue(prop, value) {
        this.values[prop] = value;
    }

    deleteValue(prop) {
        delete this.values[prop];
    }

    getValue(prop) {
        return this.values[prop];
    }

    onChange(callback) {
        this.callbacks.push(callback);
        return () => {
            const index = this.callbacks.indexOf(callback);
            if(index > -1) {
                this.callbacks.splice(index, 1);
            }
        };
    }

    notifyAboutChanges(tracker) {
        this.listeners.push(tracker);
    }

    stopListenChanges(tracker) {
        const index = this.listeners.indexOf(tracker);
        if(index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    reportChange() {
        this.listeners.filter(isUnique).forEach(tracker => tracker.reportChange());
        this.callbacks.forEach(callback => callback());
    }

}