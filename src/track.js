export function track(target, propertyName, descriptor) {
    let value;

    if(descriptor.initializer) {
        value = descriptor.initializer();
    }

    return {
        enumerable: true,
        configurable: true,
        get() {
            return value;
        },
        set(val) {
            value = val;
            this.forceUpdate();
        }
    };
}