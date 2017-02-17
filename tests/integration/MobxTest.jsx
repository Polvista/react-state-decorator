import React from 'react';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import SomeData from './SomeData';

@observer
export default class MobxTest extends React.Component {
    @observable count = 0;
    @observable title = 'Hello';
    @observable task = {
        id: 1
    };

    @observable taskDeep = {
        id: 1,
        title: 'Some title',
        nested: {
            deepProp: 'val'
        }
    };

    @observable taskCopy;

    @observable classData = new SomeData();

    @observable array = [];

    @observable sameObjTrick;

    @observable map = new Map();

    componentWillMount() {
        window.mobxTest = this;

        const obj = observable({ id: 11 });
        this.sameObjTrick = {
            selected: obj,
            all: [obj]
        };
    }

    increment() {
        this.count++;
        this.count++;
    }

    changeTask = () => {
        const newTask = { id: 2, getId() { return this.id; } };
        this.task = newTask;
        this.taskCopy = newTask;

        this.taskCopy.id = 4;

        console.log(this.task.getId());

        console.log('Mobx orig', this.task === newTask);
        console.log('Mobx ref', this.task === this.taskCopy);
    };

    changeTaskGetId = () => {
        this.task.getId = function () {
            return this.id + 5;
        }
    };

    changeDeepTaskId = () => {
        this.taskDeep.id++;
    };

    changeDeepProp = () => {
        this.taskDeep.nested.deepProp += 1;
    };

    addNewProp = () => {
        this.taskDeep.newProp = '123';
    };

    changeNewProp = () => {
        this.taskDeep.newProp += '1';
    };

    changeClassData = () => {
        this.classData.prop++;
        this.classData.title += '1';
    };

    render() {
        console.log('render Mobx');
        return (
            <div>
                <div>
                    {this.title} <button onClick={() => this.title = 'Hello there'}>Change title</button>
                </div>
                <div>
                    {this.count} <button onClick={() => this.increment()}>Increment</button>
                </div>
                <div>
                    Task id: {this.task.getId ? this.task.getId() : this.task.id}
                    <button onClick={this.changeTask}>Change task id</button>
                    <button onClick={this.changeTaskGetId}>Change task get id</button>
                </div>
                <div>
                    Deep task id: {this.taskDeep.id} title: {this.taskDeep.title} deepProp: {this.taskDeep.nested.deepProp}
                    <button onClick={this.changeDeepTaskId}>Change deep task id</button>
                    <button onClick={this.changeDeepProp}>Change deep prop</button>
                </div>
                <div>
                    New prop test: {this.taskDeep.newProp}
                    <button onClick={this.addNewProp}>Add prop</button>
                    <button onClick={this.changeNewProp}>Change new prop</button>
                </div>
                <div>
                    Class data: {this.classData.prop} {this.classData.title}
                    <button onClick={this.changeClassData}>Change class data</button>
                </div>
                <div>
                    Array test: {this.array.map((v, i) => <span key={i}>{v}, </span>)}
                    <button onClick={() => {
                        console.log(this.array);
                        window.mobxArray = this.array;
                    }}>Log Array</button>
                    <button onClick={() => this.array.push(this.array.length + 1)}>Add item</button>
                    <button onClick={() => this.array[0] = 1}>Set first</button>
                    <button onClick={() => this.array[1] = 2}>Set Second</button>
                    <button onClick={() => this.array[0]++}>Change first</button>
                    <button onClick={() => this.array.length = 0}>Change length</button>
                    <button onClick={() => this.array[100] = 100}>Set 100</button>
                </div>
                <div>
                    Same obj trick: {this.sameObjTrick.selected.id}, {this.sameObjTrick.all[0].id}
                    <button onClick={() => setTimeout(() => this.sameObjTrick.selected.id++, 0)}>Change id</button>
                </div>
                <div>
                    Map tests: {[...this.map.keys()].map(key => <span key={key}>{this.map.get(key)}</span>)}
                    <button onClick={() => this.map.set(this.map.size, this.map.size)}>Add val</button>
                    <button onClick={() => console.log(this.map)}>Log map</button>
                </div>
            </div>
        );
    }
}