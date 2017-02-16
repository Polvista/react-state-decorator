import {expect} from 'chai';
import {track} from '../../src';

class TestComponent {

    changed = 0;

    @track id = 1;

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
        let initialValue;

        beforeEach(() => {
            component = new TestComponent();
            componentCopy = new TestComponent();
        });

        it('should have tracked properties as own properties', () => {
            // need to read props to initialize them
            component.id && component.strProp && component.object && component.list && component.uninit;

            expect(component).to.have.ownProperty('id');
            expect(component).to.have.ownProperty('strProp');
            expect(component).to.have.ownProperty('object');
            expect(component).to.have.ownProperty('list');
            expect(component).to.have.ownProperty('uninit');
        });

        function testCase(name, action, getter, realChangesCount = 1) {
            describe(name, () => {
                beforeEach(() => {
                    initialValue = getter(componentCopy);
                    action();
                });

                it('should change right amount of times', () => expect(component.changed).to.be.equal(realChangesCount));
                it('should not affect copy', () => {
                    expect(getter(componentCopy)).to.be.eql(initialValue);
                    expect(componentCopy.changed).to.be.equal(0);
                });
            });
        }

        testCase('base change', () => component.strProp = 'new val', component => component.strProp);
        testCase('multiple changes', () => {
            component.strProp = 'new val';
            component.id++;
        }, component => component.strProp, 2);

        testCase('arr change', () => component.list.length = 0, component => component.list.length);

        testCase('nested change', () => component.object.deep = 'new val', component => component.object.deep);

        testCase('deep change', () => component.object.deep.deepArr[0].deepValue = 'new val', component => component.object.deep.deepArr[0].deepValue);

        testCase('deep array change', () => component.object.deep.deepArr.push('new val'), component => component.object.deep.deepArr);

        testCase('unnit init', () => component.uninit = 10, component => component.uninit);

        testCase('track new values', () => {
            component.uninit = {id: 10};
            component.uninit.id++;
        }, component => component.uninit, 2);

        testCase('dont track old values', () => {
            const origList = component.list;
            component.list = [];
            origList.push(11);
        }, component => component.list);

    });
});