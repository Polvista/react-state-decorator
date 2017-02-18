import {expect} from 'chai';
import {untracked, action} from '../../src';
import {getTrackableObject} from '../../src/types/trackableObject';
import {getTracker} from '../../src/tracker';

describe('untracked tests', () => {
    describe('as function', () => {
        describe('base', () => {
            let calledWith;
            let func = (param1, param2) => {
                calledWith = [param1, param2];
                return param1 + param2;
            };

            let wrapped;
            let callResult;

            beforeEach(() => {
                wrapped = untracked(func);
                callResult = wrapped(5, 10);
            });

            it('should be function', () => expect(typeof wrapped).to.equal('function'));
            it('should pass params', () => expect(calledWith).to.eql([5, 10]));
            it('should return value', () => expect(callResult).to.eql(15));
        });

    });
});