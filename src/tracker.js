import {runLazyInitializers} from './classPropertyDecorator';
import {addHiddenFinalProp} from './utils';

const trackerProp = '__$tracker';

export function getOrCreateTracker(instance) {
    runLazyInitializers(instance); // not sure about this

    if(instance[trackerProp])
        return instance[trackerProp];

    const tracker = { values: {} };
    addHiddenFinalProp(instance, trackerProp, tracker);

    return tracker;
}

export function getTracker(instance) {
    return instance[trackerProp];
}

