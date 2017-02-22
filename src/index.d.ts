export function track(target: Object, key: string, baseDescriptor?: PropertyDescriptor): any;

export function action(target: Object, propertyKey: string, descriptor?: PropertyDescriptor): void;
export function action<A1, R, T extends (a1: A1) => R>(fn: T): T;
export function action<T extends Function>(fn: T): T;

export function extend<A extends Object, B extends Object>(target: A, properties: B): A & B;

export function untracked<T>(action: () => T): T;
export function untracked<T extends Object>(object: T): T;