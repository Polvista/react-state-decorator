import {getTrackableArray} from './types/trackableArray';
import {getTrackableObject} from './types/trackableObject';
import {addHiddenFinalProp, isUntrackable, isCollection, isArray, create} from './utils';
import {markedUntrackable} from './core/untracked';

const trackerProp = '__$tracker';

export function getTracker(instance, isComponent) {
    if(isUntrackable(instance) || markedUntrackable(instance) || isCollection(instance))
        return;

    if(instance[trackerProp])
        return instance[trackerProp];

    const tracker = isComponent ? new ComponentTracker(instance) : new Tracker(instance);
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

    if(isTracking(target)) {
        return {
            tracker: getTracker(target),
            value: target
        };
    }

    if(isCollection(target)) {
        console.warn('Map/Set/WeakMap/WeakSet are not currently supported for state tracking');
        return {
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

    // it is plain object or class instance
    const trackableObject = getTrackableObject(target);
    return {
        tracker: getTracker(trackableObject),
        value: trackableObject
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

Tracker.prototype.onChange = function(callback) {
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

function ComponentTracker() {
    Tracker.apply(this, arguments);
    this.waitingForActionsToEnd = false;
    this.rerenderCallbackSubscription = null;
    this.isMounted = false;
}

ComponentTracker.prototype = create(Tracker.prototype);
ComponentTracker.prototype.constructor = Tracker;

ComponentTracker.prototype.isWaitingForActionsToEnd = function() {
    return this.waitingForActionsToEnd;
};

ComponentTracker.prototype.setWaitingForActionsToEnd = function(value) {
    this.waitingForActionsToEnd = value;
};

ComponentTracker.prototype.isRerenderCallbackSetted = function() {
    return this.rerenderCallbackSubscription != null;
};

ComponentTracker.prototype.setRerenderCallback = function(cb) {
    this.rerenderCallbackSubscription = Tracker.prototype.onChange.call(this, cb);
};

ComponentTracker.prototype.stopRerender = function() {
    this.rerenderCallbackSubscription && this.rerenderCallbackSubscription();
};

ComponentTracker.prototype.setMounted = function() {
    this.isMounted = true;
};