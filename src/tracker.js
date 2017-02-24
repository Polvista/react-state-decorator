import {getTrackableArray} from './types/trackableArray';
import {getTrackableObject} from './types/trackableObject';
import {addHiddenFinalProp, isUntrackable, isPlainObject, isCollection, isArray} from './utils';
import {markedUntrackable} from './core/untracked';

const trackerProp = '__$tracker';

export function getTracker(instance) {
    if(isUntrackable(instance) || markedUntrackable(instance) || isCollection(instance))
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

/**
 * Refactored to not use ES6 class, to reduce bundle size
 * */
function Tracker(target) {
    this.values = {};
    this.callbacks = [];
    this.shallowCallbacks = [];
    this.subscriptions = {};
    this.propsScopes = {};
    this.target = target;
    this.waitingForActionsToEnd = false;
    this.rerenderCallbackSetted = false;
}

Tracker.prototype._setValue = function(prop, value, shouldReport = true) {
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

        if(valueTracker) {
            // don't subscribe for changes for scope === 'ref'
            if(this.propsScopes[prop] == null) {
                this.subscriptions[prop] = valueTracker.onChange(() => this.reportChange(prop));
            } else if(this.propsScopes[prop] == 'shallow') {
                this.subscriptions[prop] = valueTracker.onShallowChange(() => this.reportChange(prop));
            }
        }
    }

    this.values[prop] = value;

    if(shouldReport && !isSame)
        this.reportChange();
};

Tracker.prototype._makeTrackable = function(target) {
    if(isUntrackable(target) || markedUntrackable(target)) {
        //TODO may be change to return target?
        return {
            value: target
        };
    }

    if(isCollection(target)) {
        console.warn('Map/Set/WeakMap/WeakSet are not currently supported for state tracking');
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
};

Tracker.prototype.setValue = function(prop, value) {
    this._setValue(prop, value);
};

Tracker.prototype.setValueSilently = function(prop, value) {
    this._setValue(prop, value, false);
};

Tracker.prototype.initValue = function(prop, value) {
    this._setValue(prop, value, false);
};

Tracker.prototype.deleteValue = function(prop) {
    this.stopListen(prop);
    delete this.values[prop];
};

Tracker.prototype.stopListen = function(prop) {
    this.subscriptions[prop] && this.subscriptions[prop]();
    delete this.subscriptions[prop];
};

Tracker.prototype.getValue = function(prop) {
    return this.values[prop];
};

Tracker.prototype.onChange = function(callback, isRerenderCallback) {
    if(isRerenderCallback)
        this.rerenderCallbackSetted = true;

    return this._addCallback(this.callbacks, callback);
};

Tracker.prototype.onShallowChange = function(callback) {
    return this._addCallback(this.shallowCallbacks, callback);
};

Tracker.prototype._addCallback = function(cbArr, callback) {
    cbArr.push(callback);

    return () => {
        const index = cbArr.indexOf(callback);
        if(index > -1) {
            cbArr.splice(index, 1);
        }
    };
};

Tracker.prototype.isRerenderCallbackSetted = function() {
    return this.rerenderCallbackSetted;
};

Tracker.prototype.isWaitingForActionsToEnd = function() {
    return this.waitingForActionsToEnd;
};

Tracker.prototype.setWaitingForActionsToEnd = function(value) {
    this.waitingForActionsToEnd = value;
};

Tracker.prototype.reportChange = function(changedProp) {
    // TODO change report algorithm so changes on objects located multiple times inside target would result in one change event
    if(changedProp && Object.getOwnPropertyDescriptor(this.target, changedProp) == null) {
        // property was deleted
        this.stopListen(changedProp);
        return;
    }

    this.callbacks.forEach(callback => callback());

    // if changedProp is not specified, object changed shallowly
    if(changedProp == null)
        this.shallowCallbacks.forEach(callback => callback());

};

Tracker.prototype.setPropScope = function(prop, scope) {
    this.propsScopes[prop] = scope;
};

/*

class Tracker {

    constructor(target) {
        this.values = {};
        this.callbacks = [];
        this.subscriptions = {};
        this.target = target;
        this.waitingForActionsToEnd = false;
        this.rerenderCallbackSetted = false;
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
        if(isUntrackable(target) || markedUntrackable(target)) {
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

    onChange(callback, isRerenderCallback) {
        this.callbacks.push(callback);

        if(isRerenderCallback)
            this.rerenderCallbackSetted = true;

        return () => {
            const index = this.callbacks.indexOf(callback);
            if(index > -1) {
                this.callbacks.splice(index, 1);
            }
        };
    }

    isRerenderCallbackSetted() {
        return this.rerenderCallbackSetted;
    }

    isWaitingForActionsToEnd() {
        return this.waitingForActionsToEnd;
    }

    setWaitingForActionsToEnd(value) {
        this.waitingForActionsToEnd = value;
    }

    reportChange(changedProp) {
        // TODO change report algorithm so changes on objects located multiple times inside target would result in one change event
        if(changedProp && Object.getOwnPropertyDescriptor(this.target, changedProp) == null) {
            // property was deleted
            this.stopListen(changedProp);
            return;
        }

        this.callbacks.forEach(callback => callback());
    }

}*/
