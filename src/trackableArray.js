import {getTracker} from './tracker';

const outOfBoundariesTrackRange = 1;

export function getTrackableArray(origArray) {
    const spyArrayPrototype = Object.create(Array.prototype);

    spyArrayPrototype.push = function (...args) {
        console.log('pushing');
        return Array.prototype.push.apply(this, args);
    };

    const spyArray = Object.create(spyArrayPrototype);
    const tracker = getTracker(spyArray);

    tracker.onChange(() => console.log('array changed'));

    console.log(spyArray);

    tracker.initValue('length', 0);
    Object.defineProperty(spyArray, 'length', {
        configurable: true,
        enumerable: true,
        get() {
            return tracker.getValue('length');
        },
        set(l){
            console.log('set length');
            const prevLength = tracker.getValue('length');

            if(prevLength > l) {
                const props = Object.getOwnPropertyNames(this);
                //TODO optimized for lopp
                for(let i = 0; i < props.length; i++) {
                    const propName = props[i];

                    if(!isNaN(parseInt(propName))) {
                        const arrayIndex = parseInt(propName);

                        if(arrayIndex > l -1) {
                            tracker.deleteValue(propName);
                        } else if(arrayIndex > (l - 1 + outOfBoundariesTrackRange)) {
                            delete this[propName];
                        }
                    }
                }
            } else if(prevLength < l) {
                for(let i = prevLength; i < l; i++) {
                    // new values

                    //tracker.
                }

                for(let i = l; i < l + outOfBoundariesTrackRange; i++) {
                    // new track boundaries
                    defineTrackableProp(this, i, tracker);
                }
            }

            tracker.setValue('length', l);
        }
    });

    window.spyArray = spyArray;
    return origArray;
}

function defineTrackableProp(target, prop, tracker) {
    Object.defineProperty(target, prop, {
        configurable: true,
        enumerable: true,
        get() {
            return tracker.getValue(prop);
        },
        set(v) {
            tracker.setValue(prop, v);
        }
    });
}