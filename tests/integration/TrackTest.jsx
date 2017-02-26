import React, {Component} from 'react';
import {state, action, extend, untracked} from './../../src';

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

const ObjComponent = ({obj}) => (
    <div onClick={() => {
        obj.id++;
        obj.id++;
    }}>{obj.id}</div>
);

class ObjCLassComponent extends Component {
    render() {
        return (
            <div onClick={() => {
                this.props.obj.id++;
                this.props.obj.id++;
            }}>{this.props.obj.id}</div>
        );
    }
}

export default class TrackTest extends Component {

    @state count = 0;
    @state title = 'Hello';
    @state task = {
        id: 1
    };

    @state taskDeep = {
        id: 191,
        title: 'Some title',
        nested: {
            deepProp: 'val'
        }
    };

    @state uninit;

    @state withGetSet;

    @state array = [1, 2, 3];

    @state objForChildFunctionalComponent = {
        id: 200
    };

    @state objForChildClassComponent = {
        id: 200
    };

    @state objForActionTest = {
        id: 300
    };

    @state addDeleteObj = {
        id: 15
    };

    @state withUntracked = {
        id: 10,
        obj: untracked({
            val: '0'
        })
    };

    @state.watchRef refObject = {
        id: 99
    };

    @state.watchShallow shallowArray = [{id: 99}, {id: 100}, {id: 101}];

    @state classObj = new ChildClass();

    componentDidMount() {
        window.trackTest = this;

        this.uninit = 10;

        let val = 3;
        this.withGetSet = {
            get val() {
                console.log('getter is working');
                return val;
            },
            set val(value) {
                console.log('setter is working');
                val = value;
            }
        };
    }

    increment() {
        this.count++;
        this.count++;
    }

    changeTask = () => this.task = { id: 2 };

    changeDeepTaskId = () => this.taskDeep.id++;

    changeDeepProp = () => this.taskDeep.nested.deepProp += 1;

    changeUninitProp = () => this.uninit++;

    changeWithGetSet = () => this.withGetSet.val++;

    @action changeWithDecoratedAction() {
        this.objForActionTest.id++;
        this.objForActionTest.id++;
    }

    @action changeWithNestedDecoratedAction() {
        this.objForActionTest.id++;
        this.objForActionTest.id++;
        action(() => {
            this.objForActionTest.id++;
            this.objForActionTest.id++;
        })()
    }

    @action changeWithDecoratedActionAndException() {
        this.objForActionTest.id++;
        this.objForActionTest.id++;
        throw new Error('fail');
    }

    render() {
        console.log('render');
        return (
            <div>
                <div>
                    {this.title} <button onClick={() => this.title = 'Hello there'}>Change title</button>
                </div>
                <div>
                    {this.count} <button onClick={() => this.increment()}>Increment</button>
                </div>
                <div>
                    Task id: {this.task.id} <button onClick={this.changeTask}>Change task id</button>
                </div>
                <div>
                    Deep task id: {this.taskDeep.id} title: {this.taskDeep.title} deepProp: {this.taskDeep.nested.deepProp}
                    <button onClick={this.changeDeepTaskId}>Change deep task id</button>
                    <button onClick={this.changeDeepProp}>Change deep prop</button>
                </div>
                <div>
                    Un-inited prop: {this.uninit}
                    <button onClick={this.changeUninitProp}>Change un-init</button>
                </div>
                <div>
                    With get/set: {this.withGetSet && this.withGetSet.val}
                    <button onClick={this.changeWithGetSet}>Change with get/set</button>
                </div>
                <div>
                    Child functional component:
                    <ObjComponent obj={this.objForChildFunctionalComponent} />
                </div>
                <div>
                    Child class component:
                    <ObjCLassComponent obj={this.objForChildClassComponent} />
                </div>
                <div>
                    Change without action: {this.objForActionTest.id}
                    <button onClick={() => {
                        setTimeout(() => {
                            this.objForActionTest.id++;
                            this.objForActionTest.id++;
                        });
                    }}>Change</button>
                </div>
                <div>
                    Change with action: {this.objForActionTest.id}
                    <button onClick={() => {
                        setTimeout(action(() => {
                            this.objForActionTest.id++;
                            this.objForActionTest.id++;
                        }));
                    }}>Change</button>
                </div>
                <div>
                    Change with decorated action: {this.objForActionTest.id}
                    <button onClick={() => this.changeWithDecoratedAction()}>Change</button>
                </div>
                <div>
                    Change with nested decorated action: {this.objForActionTest.id}
                    <button onClick={() => this.changeWithNestedDecoratedAction()}>Change</button>
                </div>
                <div>
                    Change with decorated action and exception: {this.objForActionTest.id}
                    <button onClick={() => this.changeWithDecoratedActionAndException()}>Change</button>
                </div>
                <div>
                    Add/delete prop test:
                    added: {this.addDeleteObj.addedVal && this.addDeleteObj.addedVal.id }
                    <button onClick={() => extend(this.addDeleteObj, {addedVal: {id: 40}})}>Add prop</button>
                    <button onClick={() => this.addDeleteObj.addedVal.id++}>Change added prop</button>
                </div>
                <div>
                    Change untracked obj prop: {this.withUntracked.obj.val}
                    <button onClick={() => this.withUntracked.obj.val += '1'}>Change</button>
                </div>
                <div>
                    Do untracked action: {this.task.id}
                    <button onClick={() => untracked(() => this.task.id++)}>Change</button>
                </div>
                <div>
                    watchRef: {this.refObject.id}
                    <button onClick={() => this.refObject.id++}>Change id</button>
                    <button onClick={() => this.refObject = {id: 1}}>Change obj</button>
                </div>
                <div>
                    watchShallow: {this.shallowArray.map(obj => obj.id).join(',')}
                    <button onClick={() => this.shallowArray[0].id++}>Change inner</button>
                    <button onClick={() => this.shallowArray.push({id: 1})}>Push obj</button>
                    <button onClick={() => this.shallowArray = [{id: 111}]}>Change arr</button>
                    <button onClick={() => this.shallowArray = {}}>Change to not arr</button>
                </div>
                <div>
                    Class tests: {JSON.stringify(this.classObj)}
                    <button onClick={() => this.classObj.childProp++}>Change childProp</button>
                    <button onClick={() => this.classObj.childProp2.id++}>Change childProp2</button>
                    <button onClick={() => this.classObj.childProp3.baseProp++}>Change childProp3 inner</button>
                    <button onClick={() => this.classObj.childProp3 = new BaseClass()}>Change childProp3</button>
                    <button onClick={() => this.classObj = new ChildClass()}>Renew</button>
                </div>
            </div>
        );
    }
}