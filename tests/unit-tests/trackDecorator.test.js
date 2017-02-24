import {expect} from 'chai';
import {track, action, extend, untracked} from '../../src';
import {isTracking} from '../../src/tracker';

class BaseClass {
    constructor() {
        this.baseProp = 1;
        this.baseProp2 = { id: 10 };
    }
}

class ChildClass extends BaseClass {
    constructor() {
        super();
        this.childProp = 10;
        this.childProp2 = { id: 10 };
        this.childProp3 = new BaseClass();
    }
}

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

    @track withUntrackedInside = {
        id: 1,
        obj: untracked({
            id: 10
        })
    };

    @track.watchRef refObject = {
        id: 99
    };

    @track.watchShallow shallowArray = [{id: 99}, {id: 100}, {id: 101}];

    @track objWithGlobals = {
        normal: {},
        map: new Map(),
        bool: new Boolean(false),
        num: new Number(20)
    };

    @track classObject = new ChildClass();

    @action changeSomething() {
        this.id++;
        this.id++;
        this.strProp = 'new val';
        this.list.push({id: 5});
        extend(this.object, {newProp: {val: 10}});
        this.object.newProp.val++;
    }

    @action changeWithInnerActions() {
        this.id++;
        action(() => {
            this.id++;
            extend(this.object, {newProp: {val: 10}});
            this.object.newProp.val++;
            action(() => {
                this.strProp = 'new val';
                action(() => this.list.push({id: 5}))();
            })();
        })();
    }

    @action changeWithException() {
        this.id++;
        this.strProp = 'new val';
        throw new Error('Something wrong');
    }

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
            expect(component).to.have.ownProperty('objWithGlobals');
        });

        it('should not track global objects', () => {
            expect(isTracking(component.objWithGlobals.normal)).to.be.true;
            expect(isTracking(component.objWithGlobals.map)).to.be.false;
            expect(isTracking(component.objWithGlobals.bool)).to.be.false;
            expect(isTracking(component.objWithGlobals.num)).to.be.false;
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

    describe('with action', () => {

        describe('as function', () => {
            let component;
            let exception;

            function testCase(name, func, extra = () => 0) {
                describe(name, () => {
                    beforeEach(() => {
                        component = new TestComponent();
                        try{
                            action(func)();
                        } catch(e) {
                            exception = e;
                        }
                    });

                    it('should change once', () => expect(component.changed).to.equal(1));
                    extra();
                });
            }

            testCase('action test', () => {
                component.strProp = '';
                component.list.push(11);
                component.object.deep.deepArr[0].deepValue = 'new val';
                component.object.deep.deepArr.push('new val');
                extend(component.object, {newProp: {val: 10}});
                component.object.newProp.val++;
            });

            testCase('action test nested calls', () => {
                component.strProp = '';
                action(() => {
                    component.list.push(11);
                    action(() => {
                        component.object.deep.deepArr[0].deepValue = 'new val';
                        component.object.deep.deepArr.push('new val');
                        extend(component.object, {newProp: {val: 10}});
                        component.object.newProp.val++;
                    })();
                })();
            });

            testCase('with exception', () => {
                component.strProp = 'new val';
                component.list.push(11);
                throw new Error('some fail');
            }, () => it('should throw exception', () => expect(exception.message).to.equal('some fail')))

        });

        describe('as decorator', () => {
            let component;
            let exception;

            function testCase(name, func, extra = () => 0) {
                describe(name, () => {
                    beforeEach(() => {
                        component = new TestComponent();
                        try{
                            func();
                        } catch(e) {
                            exception = e;
                        }
                    });

                    it('should change once', () => expect(component.changed).to.equal(1));
                    extra();
                });
            }

            testCase('@action test', () => component.changeSomething());

            testCase('@action with inner actions', () => component.changeWithInnerActions());

            testCase('@action with exception',
                () => component.changeWithException(),
                () => it('should throw exception', () => expect(exception.message).to.equal('Something wrong'))
            );
        });

        
    });

    describe('with untracked', () => {
        let component;

        beforeEach(() => {
            component = new TestComponent();
        });

        function testCase(name, action, realChangesCount = 0) {
            describe(name, () => {
                beforeEach(action);
                it('should not generate extra changes', () => expect(component.changed).to.equal(realChangesCount));
            });
        }

        testCase('simple call', () => {
            untracked(() => {
                component.strProp = 'new val';
                component.list.push(123);
            });
        });

        testCase('with actions', () => {
            untracked(() => {
                component.strProp = 'new val';
                action(() => {
                    component.list.push(123);
                    component.list.push(123);
                })();
            });
        });

        testCase('nested', () => {
            untracked(() => {
                component.strProp = 'new val';
                untracked(() => {
                    component.list.push(123);
                });
            });
        });

        testCase('partial', () => {
            component.id++;
            untracked(() => {
                component.id++;
                untracked(() => component.id++);
            });
            component.id++;
            untracked(() => component.list.push(123));
        }, 2);

        testCase('inside action', () => {
            action(() => {
                component.id++;
                untracked(() => {
                    component.id++;
                    untracked(() => {
                        component.id++;
                    });
                });
                component.id++;
            })();
        }, 1);
    });

    describe('with untracked object', () => {
        let component;

        beforeEach(() => {
            component = new TestComponent();
        });

        function testCase(name, action, realChangesCount = 0) {
            describe(name, () => {
                beforeEach(action);
                it('should not generate extra changes', () => expect(component.changed).to.equal(realChangesCount));
            });
        }

        testCase('add untracked object', () => {
            component.object = untracked({ id: 1 });
            component.object.id++;
            component.object.id++;
        }, 1);

        testCase('with untracked object', () => {
            component.withUntrackedInside.id++;
            component.withUntrackedInside.obj.id++;
        }, 1);


    });

    describe('watchRef tests', () => {
        let component;
        beforeEach(() => {
            component = new TestComponent();
        });

        function testCase(name, action, changesCount) {
            describe(name, () => {
                beforeEach(action);

                it('should change correct number of times', () => expect(component.changed).to.equal(changesCount));
            });
        }

        testCase('ref change', () => {
            component.refObject = { val: 'new' };
            component.refObject = {};
        }, 2);

        testCase('ignore non-ref change', () => {
            component.refObject.id++;
            component.refObject = { val: 'new' };
            component.refObject.val = {};

            component.refObject = [];
            component.refObject.push(10);
        }, 2);

    });

    describe('watchShallow tests', () => {
        let component;
        beforeEach(() => {
            component = new TestComponent();
        });

        function testCase(name, action, changesCount) {
            describe(name, () => {
                beforeEach(action);

                it('should change correct number of times', () => expect(component.changed).to.equal(changesCount));
            });
        }

        testCase('shallow changes', () => {
            component.shallowArray.push({});
            component.shallowArray = [];
        }, 2);

        testCase('ignore non-shallow change', () => {
            component.shallowArray[0].id++;
            component.shallowArray[1].id++;
            component.shallowArray.unshift({ id: 20 });
            component.shallowArray[0].id++;
            component.shallowArray = [];
            component.shallowArray.push(10);
        }, 3);

        testCase('ignore non-shallow change 2', () => {
            component.shallowArray[0].id++;
            component.shallowArray[1].id++;
            component.shallowArray.length = 0;
            component.shallowArray[0] = { id: 20 };
            component.shallowArray[0].id++;
        }, 2);

        describe('not collection assign', () => {
            let exception;
            beforeEach(() => {
                try {
                    component.shallowArray = {};
                } catch (e) {
                    exception = e;
                }
            });

            it('should throw exception', () => expect(exception).to.not.be.undefined);
        });

    });

    describe('with classes', () => {
        let component;

        function testCase(name, action, changes) {
            describe(name, () => {
                beforeEach(() => {
                    component = new TestComponent();
                    action();
                });

                it('should change right amount of times', () => expect(component.changed).to.equal(changes));
            });
        }

        testCase('class changes', () => {
            component.classObject.childProp++;
            component.classObject.childProp2.id++;
            component.classObject.childProp3 = new BaseClass();
            component.classObject.childProp3.baseProp2.id++;
            component.classObject.baseProp2.id++;
            component.classObject = new BaseClass();
            component.classObject.baseProp++;
        }, 7);
    });

});