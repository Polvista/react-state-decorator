export function defineProp(object, propName, descriptor) {
    Object.defineProperty(object, propName, descriptor);
}

export function addHiddenProp(object, propName, value) {
    defineProp(object, propName, {
        enumerable: false,
        writable: true,
        configurable: true,
        value
    });
}

export function addHiddenFinalProp(object, propName, value) {
    defineProp(object, propName, {
        enumerable: false,
        writable: false,
        configurable: false,
        value
    });
}

//TODO Boolean, Number, Dates, File, DomElements, etc
export function isUntrackable(value) {
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

export function isArray(target) {
    return Array.isArray(target);
}

export function isUnique(value, index, array) {
    return array.indexOf(value) === index;
}