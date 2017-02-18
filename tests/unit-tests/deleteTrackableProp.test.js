import {expect} from 'chai';
import {getTracker, isTracking} from '../../src/tracker';
import {deleteTrackableProp} from '../../src';

describe('deleteTrackableProp tests', () => {
    let trackedObject;
    let notTrackedObject;
    let trackedChanges;
    let notTrackedChanges;

    beforeEach(() => {
        trackedObject = {
            id: 1,
            prop: {
                val: 'val'
            }
        };

        const tracker = getTracker(trackedObject);
        trackedChanges = 0;
        tracker.onChange(() => trackedChanges++);

        notTrackedObject = {
            id: 1,
            prop: {
                val: 'val'
            }
        };
    });

    function testCase(name, action, checks) {
        describe(name, () => {
            beforeEach(action);

            checks();
        });
    }

    testCase('delete prop', () => {
        deleteTrackableProp(trackedObject, 'prop');
    }, () => {
        it('should still track object', () => expect(isTracking(trackedObject)).to.be.true);
        it('should not have prop', () => expect(Object.getOwnPropertyDescriptor(trackedObject, 'prop')).to.be.undefined);
        it('should generate change', () => expect(trackedChanges).to.be.equal(1));
    });

    testCase('delete prop 2', () => {
        const propVal = trackedObject.prop;
        deleteTrackableProp(trackedObject, 'prop');
        propVal.val += '123';
    }, () => {
        it('should not track changes on value', () => expect(trackedChanges).to.be.equal(1));
    });

    testCase('delete prop from untracked',
        () => {
            deleteTrackableProp(notTrackedObject, 'prop');
        },
        () => {
            it('should not be tracked', () => expect(isTracking(notTrackedObject)).to.be.false);
            it('should delete prop', () => expect(Object.getOwnPropertyDescriptor(notTrackedObject, 'prop')).to.be.undefined);
        }
    );

});