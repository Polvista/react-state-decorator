import {getTracker} from './tracker';

export const outOfBoundariesTrackRange = 1;
const ignoreChangesProp = '__$trackIgnoreChanges';
const mutatingMethods = ['shift', 'push', 'pop'];

const trackableArrayPrototype = Object.create(Array.prototype);
mutatingMethods.forEach(defineTrackableArrayMethod);

export function getTrackableArray(origArray) {
    const trackableArray = Object.create(trackableArrayPrototype);
    const tracker = getTracker(trackableArray);

    // init array
    for(let i = 0; i < origArray.length; i++) {
        defineTrackableProp(trackableArray, i, tracker, false);
        tracker.initValue(i, origArray[i]); //TODO make trackable
    }

    tracker.initValue('length', origArray.length);

    defineTrackableProp(trackableArray, origArray.length, tracker, true);
    Object.defineProperty(trackableArray, 'length', {
        configurable: true,
        enumerable: false,
        get() {
            return tracker.getValue('length');
        },
        set(l){
            const prevLength = tracker.getValue('length');
            console.log('set length', prevLength, l);

            if(prevLength > l) {
                for(let i = l; i < prevLength; i++) {
                    // old values
                    tracker.deleteValue(i);
                }

                for(let i = l; i < l + outOfBoundariesTrackRange; i++) {
                    // new track boundaries
                    defineTrackableProp(this, i, tracker, true);
                }

                for(let i = l + outOfBoundariesTrackRange; i < prevLength + outOfBoundariesTrackRange; i++) {
                    // old boundaries
                    delete this[i];
                }
            } else if(prevLength < l) {
                for(let i = prevLength; i < l; i++) {
                    // new values
                    defineTrackableProp(this, i, tracker, false);
                }

                for(let i = l; i < l + outOfBoundariesTrackRange; i++) {
                    // new track boundaries
                    defineTrackableProp(this, i, tracker, true);
                }
            }

            tracker.setValue('length', l);
        }
    });

    (global || window).trackableArray = trackableArray;
    return trackableArray;
}

function defineTrackableProp(target, prop, tracker, isOutOfBoundaries) {
    Object.defineProperty(target, prop, {
        configurable: true,
        enumerable: !isOutOfBoundaries,
        get() {
            return tracker.getValue(prop);
        },
        set(v) {
            if(this[ignoreChangesProp]) {
                console.log('ignoring');
                tracker.initValue(prop, v); //TODO make trackable
                return;
            }

            if(isOutOfBoundaries) {
                console.log('ouOB');
                tracker.initValue(prop, v); //TODO make trackable
                target.length = Number(prop) + 1;
            } else {
                tracker.setValue(prop, v);
            }
        }
    });
}

function defineTrackableArrayMethod(name) {
    Object.defineProperty(trackableArrayPrototype, name, {
        configurable: true,
        enumerable: false,
        value() {
            Object.defineProperty(this, ignoreChangesProp, {
                configurable: true,
                enumerable: false,
                value: true
            });
            const result = Array.prototype[name].apply(this, arguments);
            delete this[ignoreChangesProp];
            return result;
        }
    });
}