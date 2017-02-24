/**
 * Put some global functions in variables, so it could be minified efficiently
 * */
export const defineProp = Object.defineProperty;
export const getOwnPropertyNames = Object.getOwnPropertyNames;

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

/**
 * What could possible be written in state?
 *
 * Blob Boolean Date File FileList FormData Location Map Number Promise Set String Symbol WeakSet WeakMap XMLHttpRequest
 *
 * */
const browserObjectsThatShouldNotBeTracked =
    ['Blob', 'Boolean', 'Date', 'File', 'FileList', 'FormData', 'Location', 'Number', 'Promise', 'String', 'Symbol', 'XMLHttpRequest'];

const collections = ['Map', 'Set', 'WeakMap', 'WeakSet'];

const topObject = global || window;

function isExistInBrowser(globalObjectName) {
    return topObject[globalObjectName] !== undefined;
}

const existingBrowserObjectsThatShouldNotBeTracked = browserObjectsThatShouldNotBeTracked
    .filter(isExistInBrowser);

const existingCollections = collections.filter(isExistInBrowser);

export function isUntrackable(value) {
    const type = typeof value;
    return value == null ||
           (type != "object" && type != "function") ||
           isGlobalObject(value)
}

export function isGlobalObject(value) {
    return existingBrowserObjectsThatShouldNotBeTracked.some(globalObjectName => value instanceof topObject[globalObjectName]);
}

export function isCollection(value) {
    return existingCollections.some(collection => value instanceof topObject[collection]);
}

export function isArray(target) {
    return Array.isArray(target);
}

export function isUnique(value, index, array) {
    return array.indexOf(value) === index;
}