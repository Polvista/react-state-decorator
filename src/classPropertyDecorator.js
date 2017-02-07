import {addHiddenProp} from './utils';

const lazyInitializeProp = '__$trackLazyInitializers';
const lazyInitializationDoneProp = '__$trackLazyInitializationDone';

export default function classPropertyDecorator(target, propertyName, descriptor, initialize, get, set) {
    if(descriptor) {
        // babel and typescript

        if(!target.hasOwnProperty(lazyInitializeProp)) {
            addHiddenProp(target, lazyInitializeProp, (target[lazyInitializeProp] && target[lazyInitializeProp].slice()) || []);
        }

        target[lazyInitializeProp].push(instance => {
            initialize(
                instance,
                descriptor.initializer ? descriptor.initializer.call(instance) : descriptor.value
            );
        });

        return {
            enumerable: true,
            configurable: true,
            get() {
                this[lazyInitializationDoneProp] !== true && runLazyInitializers(this);

                return get.call(this);
            },
            set(value) {
                this[lazyInitializationDoneProp] !== true && runLazyInitializers(this);

                set.call(this, value);
            }
        };
    }
}

export function runLazyInitializers(instance) {
    if (instance[lazyInitializationDoneProp] === true)
        return;

    if (instance[lazyInitializeProp]) {
        addHiddenProp(instance, lazyInitializationDoneProp, true);
        instance[lazyInitializationDoneProp] && instance[lazyInitializeProp].forEach(initializer => initializer(instance));
    }
}
