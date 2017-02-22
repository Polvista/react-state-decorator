import {expect} from 'chai';
import {getTracker, isTracking} from '../../src/tracker';
import {extend} from '../../src';

describe('extend tests', () => {
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

        extend(trackedObject, {
            newProp: {someData: 20},
            newProp2: {someData: 20}
        });
        extend(notTrackedObject, {newProp: { someData: 20 }});

        notTrackedChanges = 0;
        if(isTracking(notTrackedObject))
            getTracker(notTrackedObject).onChange(() => notTrackedChanges++);

        if(trackedObject.newProp)
            trackedObject.newProp.someData++;

        if(trackedObject.newProp2) {
            trackedObject.newProp2.someData++;
            trackedObject.newProp2.someData++;
        }

        if(notTrackedObject.newProp)
            notTrackedObject.newProp.someData++;
    });

    it('should track object 1', () => expect(isTracking(trackedObject)).to.be.true);
    it('should track object 2', () => expect(isTracking(notTrackedObject)).to.be.true);
    it('should add prop', () => expect(trackedObject.newProp).to.be.eql( { someData: 21 } ));
    it('should add prop2', () => expect(trackedObject.newProp2).to.be.eql( { someData: 22 } ));
    it('should generate change', () => expect(trackedChanges).to.eql(4));
    it('should track changes on value', () => expect(notTrackedChanges).to.eql(1));

});