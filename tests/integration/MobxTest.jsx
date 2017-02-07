import React from 'react';
import {observable} from 'mobx';
import {observer} from 'mobx-react';

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

    increment() {
        this.count++;
        this.count++;
    }

    changeTask = () => {
        this.task = { id: 2 };
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
                    Task id: {this.task.id} <button onClick={this.changeTask}>Change task id</button>
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
            </div>
        );
    }
}