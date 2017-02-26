import {expect} from 'chai';
import {untracked, action} from '../../src';
import {getTrackableObject} from '../../src/types/trackableObject';
import {getTracker} from '../../src/core/tracker';

describe('untracked tests', () => {
    describe('as function', () => {
        describe('base', () => {
            let callResult;

            beforeEach(() => {
                callResult = untracked(() => 20);
            });

            it('should return value', () => expect(callResult).to.eql(20));
        });

    });
});