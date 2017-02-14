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

    describe('changes', () => {});

});