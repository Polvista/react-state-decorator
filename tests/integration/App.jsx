import React, {Component} from 'react';
import {track} from './../../src';

export default class App extends Component {

    @track count = 0;
    @track title = 'Hello';
    @track task = {
        id: 1
    };

    increment() {
        this.count++;
        this.count++;
    }

    changeTask = () => {
        this.task = { id: 2 };
    };

    render() {
        console.log('render');
        return (
            <div>
                {this.title}
                <br />
                {this.count}
                <br />
                Task id: {this.task.id}
                <br />
                <button onClick={() => this.increment()}>Increment</button>
                <button onClick={() => this.title = 'Hello there'}>Change title</button>
                <button onClick={this.changeTask}>Change task id</button>
            </div>
        );
    }
}