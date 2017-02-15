import {expect} from 'chai';
import {getTrackableObject} from '../../src/types/trackableObject';
import {getTracker, isTracking} from '../../src/tracker';

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

});