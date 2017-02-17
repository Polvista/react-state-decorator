import {expect} from 'chai';
import {getTracker, isTracking} from '../../src/tracker';
import {addTrackableProp} from '../../src';

describe('addTrackableProp tests', () => {
    let trackedObject;
    let notTrackedObject;
    let trackedChanges;
    let notTrackedChanges;

    before(() => {
        trackedObject = {
            id: 1,
            value: 10
        };

        const tracker = getTracker(trackedObject);
        trackedChanges = 0;
        tracker.onChange(() => trackedChanges++);

        notTrackedObject = {
            id: 1,
            value: 10
        };

        addTrackableProp(trackedObject, 'newProp', { someData: 20 });
        addTrackableProp(notTrackedObject, 'newProp', { someData: 20 });

        notTrackedChanges = 0;
        if(isTracking(notTrackedObject))
            getTracker(notTrackedObject).onChange(() => notTrackedChanges++);

        if(trackedObject.newProp)
            trackedObject.newProp.someData++;

        if(notTrackedObject.newProp)
            notTrackedObject.newProp.someData++;
    });

    it('should track object 1', () => expect(isTracking(trackedObject)).to.be.true);
    it('should track object 2', () => expect(isTracking(notTrackedObject)).to.be.true);
    it('should add prop', () => expect(trackedObject.newProp).to.be.eql( { someData: 21 } ));
    it('should generate change', () => expect(trackedChanges).to.eql(2));
    it('should track changes on value', () => expect(notTrackedChanges).to.eql(1));

});