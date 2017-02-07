export function track(target, propertyName, descriptor) {
    let value;
    let update;

    if(descriptor.initializer) {
        value = descriptor.initializer();
        if(typeof value === 'object') {
            trackProperties(value, () => update());
        }
    }

    function createDescriptor(initialValue, onChange) {
        let value = initialValue;

        return {
            enumerable: true,
            configurable: true,
            get() {
                return value;
            },
            set(val) {
                const isChanged = value !== val;
                value = val;
                isChanged && onChange();
            }
        };
    }

    function trackProperties(object, onChange) {
        const keys = Object.keys(object);

        keys.forEach(key => {
            const propValue = object[key];
            Object.defineProperty(object, key, createDescriptor(propValue, onChange));
            if(typeof propValue === 'object') {
                trackProperties(propValue, onChange);
            }
        });
    }

    return {
        enumerable: true,
        configurable: true,
        get() {
            if(!update) {
                update = () => this.forceUpdate();
            }
            return value;
        },
        set(val) {
            if(!update) {
                update = () => this.forceUpdate();
            }
            const isChanged = value !== val;
            value = val;
            isChanged && this.forceUpdate();
            if(typeof value === 'object') {
                trackProperties(val, () => this.forceUpdate());
            }
        }
    };
}