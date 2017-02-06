import React, {Component} from 'react';
import {track} from './../../src';

export default class App extends Component {

    @track count = 0;

    increment() {
        this.count++;
        this.count++;
    }

    render() {
        return (
            <div>
                {this.count}
                <button onClick={() => this.increment()}>Increment</button>
            </div>
        );
    }
}