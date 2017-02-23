import {addHiddenProp} from './utils';

const lazyInitializeProp = '__$trackLazyInitializers';
const lazyInitializationDoneProp = '__$trackLazyInitializationDone';
const typescriptInitializedProps = '__$trackTypescriptInitializedProps';

export default function classPropertyDecorator(target, propertyName, descriptor, initialize, get, set) {
    if(descriptor) {
        // babel and typescript get / set props

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
    } else {
        // typescript except getter / setter props

        return {
            enumerable: true,
            configurable: true,
            get() {
                if (!this[typescriptInitializedProps] || this[typescriptInitializedProps][propertyName] !== true)
                    initializeTypescriptProperty(this, propertyName, undefined, initialize);
                return get.call(this);
            },
            set(v) {
                if (!this[typescriptInitializedProps] || this[typescriptInitializedProps][propertyName] !== true) {
                    initializeTypescriptProperty(this, propertyName, v, initialize);
                } else {
                    set.call(this, v);
                }
            }
        };
    }
}

function runLazyInitializers(instance) {
    if (instance[lazyInitializationDoneProp] === true)
        return;

    if (instance[lazyInitializeProp]) {
        addHiddenProp(instance, lazyInitializationDoneProp, true);
        instance[lazyInitializationDoneProp] && instance[lazyInitializeProp].forEach(initializer => initializer(instance));
    }
}

function initializeTypescriptProperty(instance, prop, value, initialize) {
    if (instance[typescriptInitializedProps] === undefined)
        addHiddenProp(instance, typescriptInitializedProps, {});

    instance[typescriptInitializedProps][prop] = true;
    initialize(instance, value);
}
