import {expect} from 'chai';
import {track} from '../../src';

class TestComponent {

    changed = 0;

    @track strProp = 'value';

    @track object = {
        id: 11,
        deep: {
            deepArr: [
                {
                    deepValue: 'val'
                }
            ]
        }
    };

    @track list = [{id: 1}, {id: 2}, {id: 3}, {id: 4}];

    @track uninit;

    forceUpdate() {
        this.changed++;
    }

}

describe('track decorator tests', () => {
    describe('base', () => {
        let component;
        let componentCopy;

        beforeEach(() => {
            component = new TestComponent();
            componentCopy = new TestComponent();
        });

        function testCase(name, action, getter, realChangesCount = 1) {
            describe(name, () => {
                beforeEach(action);

                it('should change right amount of times', () => expect(component.changed).to.be.equal(realChangesCount));
                it('should not affect copy', () => {
                    expect(getter(component)).to.not.be.eql(getter(componentCopy));
                    expect(componentCopy.changed).to.be.equal(0);
                });
            });
        }

        testCase('base change', () => component.title = 'new val', component => component.title);
    });
});