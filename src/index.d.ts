export function track(target: Object, key: string, baseDescriptor?: PropertyDescriptor): any;
export function action(target: Object, propertyKey: string, descriptor?: PropertyDescriptor): void;
export function action<A1, R, T extends (a1: A1) => R>(fn: T): T;
export function action<T extends Function>(fn: T): T;
export {addTrackableProp};
export {deleteTrackableProp};
export function untracked<T>(action: () => T): T;
export function untracked(object: any): void;


declare function addTrackableProp(target: any, propertyName: string, value: any): void;
declare function deleteTrackableProp(target: any, propertyName: string): void;