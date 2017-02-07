import React, {Component} from 'react';
import {track} from './../../src';

export default class TrackTest extends Component {
    @track count = 0;
    @track title = 'Hello';
    @track task = {
        id: 1
    };

    @track taskDeep = {
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
            </div>
        );
    }
}