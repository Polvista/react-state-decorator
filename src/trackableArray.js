import {getTracker} from './tracker';

export const outOfBoundariesTrackRange = 1;

export function getTrackableArray(origArray) {
    const spyArrayPrototype = Object.create(Array.prototype);

    Object.defineProperty(spyArrayPrototype, 'push', {
        configurable: true,
        enumerable: false,
        value(...args) {
            return Array.prototype.push.apply(this, args);
        }
    });

    const spyArray = Object.create(spyArrayPrototype);
    const tracker = getTracker(spyArray);

    //tracker.onChange(() => console.log('array changed'));

    //console.log(spyArray);

    // init array
    for(let i = 0; i < origArray.length; i++) {
        defineTrackableProp(spyArray, i, tracker, false);
        tracker.initValue(i, origArray[i]); //TODO make trackable
    }

    tracker.initValue('length', origArray.length);
    defineTrackableProp(spyArray, origArray.length, tracker, true);

    Object.defineProperty(spyArray, 'length', {
        configurable: true,
        enumerable: false,
        get() {
            return tracker.getValue('length');
        },
        set(l){
            const prevLength = tracker.getValue('length');

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

    (global || window).spyArray = spyArray;
    return spyArray;
}

function defineTrackableProp(target, prop, tracker, isOutOfBoundaries) {
    Object.defineProperty(target, prop, {
        configurable: true,
        enumerable: !isOutOfBoundaries,
        get() {
            return tracker.getValue(prop);
        },
        set(v) {
            if(isOutOfBoundaries) {
                tracker.initValue(prop, v);
                target.length = Number(prop) + 1;
            } else {
                tracker.setValue(prop, v);
            }
        }
    });
}