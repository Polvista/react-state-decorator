import {expect} from 'chai';
import {extend} from '../../src';
import {getTrackableObject} from '../../src/types/trackableObject';
import {getTracker, isTracking} from '../../src/core/tracker';

class BaseClass {
    constructor() {
        this.baseProp = 1;
        this.baseProp2 = { id: 10 };
    }
}

class ChildClass extends BaseClass {
    constructor() {
        super();
        this.childProp = 10;
        this.childProp2 = { id: 10 };
        this.childProp3 = new BaseClass();
    }
}

function checkForInProps(trackable, obj) {
    const trackableProps = [];
    const arrProps = [];

    for(let i in trackable)
        trackableProps.push(i);

    for(let i in obj)
        arrProps.push(i);

    expect(trackableProps).to.be.eql(arrProps);
}

function getDeepCopy(object) {
    if(object instanceof Array || typeof object !== 'object')
        return object;

    const res = {};
    Object.keys(object).forEach(prop => {
        if(object[prop] instanceof Array) {
            res[prop] = object[prop].slice();
        } else {
            res[prop] = getDeepCopy(object[prop]);
        }
    });

    return res;
}

describe('trackableObject tests', () => {

    describe('base', () => {
        let object;
        let objectCopy;
        let trackableObject;

        beforeEach(() => {
            object = {
                id: 1,
                title: 'test obj'
            };

            Object.defineProperty(object, 'unconfigurable', {
                configurable: false,
                value: 'unconfigurable'
            });

            Object.defineProperty(object, 'unwritable', {
                configurable: true,
                writable: false,
                value: 'unwritable'
            });

            objectCopy = {
                id: 1,
                title: 'test obj'
            };

            trackableObject = getTrackableObject(object);
        });

        it('should be equal', () => expect(trackableObject).to.be.equal(object));
        it('should be trackable', () => expect(isTracking(trackableObject)).to.be.true);
        it('should have same Object.keys', () => expect(Object.keys(trackableObject)).to.be.eql(Object.keys(objectCopy)));
        it('should have same for in props', () => checkForInProps(trackableObject, objectCopy));
        it('should ignore unconfigurable or unwritable props', () => {
            expect(Object.getOwnPropertyDescriptor(trackableObject, 'unconfigurable').configurable).to.be.false;
            expect(Object.getOwnPropertyDescriptor(trackableObject, 'unwritable').writable).to.be.false;
        });
        it('should have same values', () => expect(trackableObject).to.be.deep.equal(objectCopy));
        it('should work with JSON.stringify()', () => expect(JSON.stringify(trackableObject)).to.be.equal(JSON.stringify(objectCopy)));

    });

    describe('changes', () => {
        let objectCopy;
        let trackableObject;
        let tracker;
        let changesCount;
        let unsub;

        beforeEach(() => {
            let object = {
                id: 1,
                title: 'test obj',
                nested: {
                    id: 2,
                    param: 4,
                    inner: {
                        value: 'deeep value'
                    }
                },
                arr: [1, 2, 3, 4]
            };

            objectCopy = {
                id: 1,
                title: 'test obj',
                nested: {
                    id: 2,
                    param: 4,
                    inner: {
                        value: 'deeep value'
                    }
                },
                arr: [1, 2, 3, 4]
            };

            trackableObject = getTrackableObject(object);
            tracker = getTracker(trackableObject);

            changesCount = 0;
            unsub = tracker.onChange(() => changesCount++);
        });

        afterEach(() => unsub && unsub());

        function testCase(name, action, realChangesCount = 1) {
            describe(name, () => {

                beforeEach(() => {
                    action(trackableObject);
                    action(objectCopy);
                });

                it('should be deep equal', () => expect(getDeepCopy(trackableObject)).to.be.deep.equal(objectCopy));
                it(`should have changed ${realChangesCount} time`, () => expect(changesCount).to.be.equal(realChangesCount));
            });
        }

        testCase('change prop', obj => obj.title = 'changed');

        testCase('change 2 props', obj => {
            obj.id++;
            obj.title = 'changed title';
        }, 2);

        testCase('change nested', obj => obj.nested.param = 'new');

        testCase('change deeep', obj => obj.nested.inner.value = 'changed deeep value');

        testCase('change array', obj => obj.arr.push(8));

        testCase('track new objects', obj => {
            obj.title = {
                value: 'initial'
            };

            obj.title.value = 'changed'
        }, 2);

        testCase('track new deep objects', obj => {
            obj.title = {
                inner: {
                    value: 'initial'
                }
            };

            obj.title.inner.value = 'changed'
        }, 2);


        testCase('track new arrays', obj => {
            obj.title = [1,2,3];

            obj.title.push('changed');
        }, 2);

        testCase('dont track changed props', obj => {
            const nested = obj.nested;
            obj.nested = {};
            nested.id++;
        });

        testCase('dont track deleted props', obj => {
            const nested = obj.nested;
            delete obj.nested;
            nested.id++;
        }, 0);

    });

    describe('class instances', () => {
        let object;
        let changes;

        function testCase(name, init, action, checks) {
            describe(name, () => {
                beforeEach(() => {
                    changes = 0;
                    init();
                    getTrackableObject(object);
                    getTracker(object).onChange(() => changes++);
                    action();
                });

                checks();
            });
        }

        testCase(
            'track class instance',
            () => object = new BaseClass(),
            () => {
                object.baseProp = 40;
                object.baseProp2.id++;
            },
            () => {
                it('should track only props', () => {
                    const trackedProps = Object.getOwnPropertyNames(getTracker(object).values);
                    expect(trackedProps).to.deep.equal(['baseProp', 'baseProp2']);
                });

                it('should change right amount of times', () => expect(changes).to.equal(2));
            }
        );

        testCase(
            'inheritance',
            () => object = new ChildClass(),
            () => {
                object.baseProp++;
                object.baseProp2.id++;
                object.childProp++;
                object.childProp2.id++;
                object.childProp3.baseProp = 99;
            },
            () => {
                it('should track only props', () => {
                    const trackedProps = Object.getOwnPropertyNames(getTracker(object).values);
                    expect(trackedProps).to.deep.equal(['baseProp', 'baseProp2', 'childProp', 'childProp2', 'childProp3']);
                });

                it('should change right amount of times', () => expect(changes).to.equal(5));
            }
        );

        testCase(
            'extend test',
            () => object = new BaseClass(),
            () => {
                extend(object, {
                    newProp: {
                        id: 10
                    }
                });

                object.newProp.id++;
                object.newProp = new BaseClass();
                object.newProp.baseProp2.id++;
            },
            () => {
                it('should track only props', () => {
                    const trackedProps = Object.getOwnPropertyNames(getTracker(object).values);
                    expect(trackedProps).to.deep.equal(['baseProp', 'baseProp2', 'newProp']);
                });

                it('should change right amount of times', () => expect(changes).to.equal(4));
            }
        );
    });

});