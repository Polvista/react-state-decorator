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
            </div>
        );
    }
}