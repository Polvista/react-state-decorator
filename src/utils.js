export function addHiddenProp(object, propName, value) {
    Object.defineProperty(object, propName, {
        enumerable: false,
        writable: true,
        configurable: true,
        value
    });
}

export function addHiddenFinalProp(object, propName, value) {
    Object.defineProperty(object, propName, {
        enumerable: false,
        writable: false,
        configurable: true,
        value
    });
}

export function isPrimitive(value) {
    const type = typeof value;
    return value == null || (type != "object" && type != "function");
}

export function isObject(target) {
    return target !== null && typeof target === "object";
}

export function isPlainObject(target) {
    if (target === null || typeof target !== "object")
        return false;
    const proto = Object.getPrototypeOf(target);
    return proto === Object.prototype || proto === null;
}

export function isUnique(value, index, array) {
    return array.indexOf(value) === index;
}