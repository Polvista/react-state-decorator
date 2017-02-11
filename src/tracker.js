import {runLazyInitializers} from './classPropertyDecorator';
import {addHiddenFinalProp, isPrimitive, isPlainObject, isUnique} from './utils';

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
        return {};
    }

    if(isTrackable(target)) {
        return {
            tracker: getTracker(target)
        };
    }

    if(isPlainObject(target)) {
        const tracker = getTracker(target);

        Object.getOwnPropertyNames(target).forEach(propName => {
            const descriptor = Object.getOwnPropertyDescriptor(target, propName);
            if(!descriptor || descriptor.writable === false || descriptor.configurable === false) {
                return;
            }

            const propValue = target[propName];
            const {tracker: propTracker} = makeTrackable(propValue);
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

        return {tracker};
    }

    return {};
}

function isTrackable(target) {
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
            const {tracker: valueTracker} = makeTrackable(value);
            if(valueTracker) {
                valueTracker.notifyAboutChanges(this);
            }

            const currTracker = getTracker(currValue);
            if(currTracker) {
                currTracker.stopListenChanges(this);
            }
        }

        this.values[prop] = value;

        if(!isSame) {
            this.reportChange();
        }
    }

    initValue(prop, value) {
        this.values[prop] = value;
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