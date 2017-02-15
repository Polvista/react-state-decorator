import {getTrackableArray} from './types/trackableArray';
import {getTrackableObject} from './types/trackableObject';
import {addHiddenFinalProp, isPrimitive, isPlainObject, isUnique, isArray} from './utils';

const trackerProp = '__$tracker';

export function getTracker(instance) {
    //runLazyInitializers(instance); // not sure about this

    if(isPrimitive(instance))
        return;

    if(instance[trackerProp])
        return instance[trackerProp];

    const tracker = new Tracker(instance);
    addHiddenFinalProp(instance, trackerProp, tracker);

    return tracker;
}

export function isTracking(target) {
    return target[trackerProp] != null;
}

class Tracker {

    constructor(target) {
        this.values = {};
        this.callbacks = [];
        this.subscriptions = {};
        this.target = target;
    }

    // private

    _setValue(prop, value, shouldReport = true) {
        const currValue = this.getValue(prop);
        const isSame = currValue === value;

        if(!isSame) {
            const {
                tracker: valueTracker,
                value: newValue
            } = this._makeTrackable(value);

            if(newValue)
                value = newValue;

            this.stopListen(prop);

            if(valueTracker)
                this.subscriptions[prop] = valueTracker.onChange(() => this.reportChange(prop));
        }

        this.values[prop] = value;

        if(shouldReport && !isSame)
            this.reportChange();
    }

    _makeTrackable(target) {
        if(isPrimitive(target)) {
            //TODO may be change to return target?
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
            const trackableObject = getTrackableObject(target);
            return {
                tracker: getTracker(trackableObject),
                value: trackableObject
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

    // end private

    setValue(prop, value) {
        this._setValue(prop, value);
    }

    setValueSilently(prop, value) {
        this._setValue(prop, value, false);
    }

    initValue(prop, value) {
        this._setValue(prop, value, false);
    }

    deleteValue(prop) {
        this.stopListen(prop);
        delete this.values[prop];
    }

    stopListen(prop) {
        this.subscriptions[prop] && this.subscriptions[prop]();
        delete this.subscriptions[prop];
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

    reportChange(changedProp) {
        if(changedProp && Object.getOwnPropertyDescriptor(this.target, changedProp) == null) {
            return;
        }

        this.callbacks.forEach(callback => callback());
    }

}