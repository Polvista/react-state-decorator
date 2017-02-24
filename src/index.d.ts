interface TrackInterface {
    (target: Object, key: string, baseDescriptor?: PropertyDescriptor): any;
    watchRef(target: Object, key: string, baseDescriptor?: PropertyDescriptor): any;
    watchShallow(target: Object, key: string, baseDescriptor?: PropertyDescriptor): any;
}

export const track: TrackInterface;

export function action(target: Object, propertyKey: string, descriptor?: PropertyDescriptor): void;
export function action<A1, R, T extends (a1: A1) => R>(fn: T): T;
export function action<A1, A2, R, T extends (a1: A1, a2: A2) => R>(fn: T): T;
export function action<A1, A2, A3, R, T extends (a1: A1, a2: A2, a3: A3) => R>(fn: T): T;
export function action<A1, A2, A3, A4, R, T extends (a1: A1, a2: A2, a3: A3, a4: A4) => R>(fn: T): T;
export function action<A1, A2, A3, A4, A5, R, T extends (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => R>(fn: T): T;
export function action<T extends Function>(fn: T): T;

export function extend<A extends Object, B extends Object>(target: A, properties: B): A & B;

export function untracked<T>(action: () => T): T;
export function untracked<T extends Object>(object: T): T;