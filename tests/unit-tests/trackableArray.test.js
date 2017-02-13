import {expect} from 'chai';
import {getTrackableArray, outOfBoundariesTrackRange} from '../../src/trackableArray';
import {getTracker, isTracking} from '../../src/tracker';

function checkForInProps(trackable, arr) {
    const trackableProps = [];
    const arrProps = [];

    for(let i in trackable)
        trackableProps.push(i);

    for(let i in arr)
        arrProps.push(i);

    expect(trackableProps).to.be.eql(arrProps);
}

function checkOutOfBoundariesProps(trackable) {
    for(let i = trackable.length; i < trackable.length + outOfBoundariesTrackRange; i++) {
        expect(Object.getOwnPropertyDescriptor(trackable, i)).to.exist;
    }

    const extraProps = Object.getOwnPropertyNames(trackable)
        .map(Number)
        .filter(v => !isNaN(v))
        .filter(v => v >= trackable.length + outOfBoundariesTrackRange);

    expect(extraProps.length).to.be.equal(0);
}

describe('trackableArray tests', () => {

    describe('base', () => {
        let array;
        let trackableArray;

        beforeEach(() => {
            array = [1, 2, 3];
            trackableArray = getTrackableArray(array);
        });



        it('should be array', () => {
            expect(trackableArray instanceof Array).to.be.true;

            // :(
            //expect(Array.isArray(trackableArray)).to.be.true;
            //expect(Object.prototype.toString().call(trackableArray)).to.be.equal('[object Array]');
        });

        it('sadly should not be equal', () => expect(trackableArray).to.not.equal(array));
        it('should be trackable', () => expect(isTracking(trackableArray)).to.be.true);
        it('should be initialized', () => {
            expect(trackableArray.length).to.be.equal(array.length);
            expect(trackableArray[array.length]).to.not.exist;
            for(let i in array) {
                expect(trackableArray[i]).to.be.equal(array[i]);
            }
        });

        it('should have same Object.keys', () => expect(Object.keys(trackableArray)).to.be.eql(Object.keys(array)));
        it('should have same for in props', () => checkForInProps(trackableArray, array));
        it('should have hidden out of boundaries props', () => checkOutOfBoundariesProps(trackableArray));
        it('should slice like array', () => expect(trackableArray.slice()).to.be.eql(array));
    });

    describe('changes', () => {
        let array;
        let arrayCopy;
        let trackableArray;
        let tracker;
        let changesCount;
        let unsub;

        beforeEach(() => {
            array = [1, 2, 3];
            arrayCopy = [1, 2, 3];
            trackableArray = getTrackableArray(array);
            tracker = getTracker(trackableArray);

            changesCount = 0;
            unsub = tracker.onChange(() => changesCount++);
        });

        afterEach(() => {
            unsub && unsub();
        });

        function checkArraysHaveSameData() {
            it('should have correct length', () => expect(trackableArray.length).to.be.equal(arrayCopy.length));
            it('should have same Object.keys', () => expect(Object.keys(trackableArray)).to.be.eql(Object.keys(arrayCopy)));
            it('should have same for in props', () => checkForInProps(trackableArray, arrayCopy));
            it('should have hidden out of boundaries props', () => checkOutOfBoundariesProps(trackableArray));
            it('should have same values', () => expect(trackableArray.slice()).to.be.eql(arrayCopy));
        }

        function checkArrayChangedOnce() {
            it('should have changed once', () => expect(changesCount).to.be.equal(1));
        }

        function testCase(name, beforeEachFunc) {
            describe(name, () => {
                beforeEach(beforeEachFunc);

                checkArraysHaveSameData();
                checkArrayChangedOnce();
            });
        }

        testCase('#push', () => {
            trackableArray.push(4);
            arrayCopy.push(4);
        });

        testCase('#push multiple', () => {
            trackableArray.push(4, 5, 6);
            arrayCopy.push(4, 5, 6);
        });

        testCase('#pop', () => {
            trackableArray.pop();
            arrayCopy.pop();
        });

        testCase('#shift', () => {
            trackableArray.shift();
            arrayCopy.shift();
        });

        testCase('#unshift', () => {
            trackableArray.unshift(333);
            arrayCopy.unshift(333);
        });

        testCase('#unshift multiple', () => {
            trackableArray.unshift(300, 301, 302);
            arrayCopy.unshift(300, 301, 302);
        });

        testCase('set length = 0', () => {
            trackableArray.length = 0;
            arrayCopy.length = 0;
        });

        testCase('direct change', () => {
            trackableArray[1] = 0;
            arrayCopy[1] = 0;
        });

        testCase('direct change first', () => {
            trackableArray[0] = 99;
            arrayCopy[0] = 99;
        });

        testCase('direct change last', () => {
            trackableArray[trackableArray.length - 1] = 199;
            arrayCopy[arrayCopy.length - 1] = 199;
        });

        testCase('direct add', () => {
            trackableArray[trackableArray.length] = 'new val';
            arrayCopy[arrayCopy.length] = 'new val';
        })

    });

});


