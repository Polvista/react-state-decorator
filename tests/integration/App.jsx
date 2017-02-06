import React, {Component} from 'react';
import {track} from './../../src';

export default class App extends Component {

    @track count = 0;
    @track title = 'Hello';

    increment() {
        this.count++;
        this.count++;
    }

    render() {
        console.log('render');
        return (
            <div>
                {this.title}
                <br />
                {this.count}
                <br />
                <button onClick={() => this.increment()}>Increment</button>
                <button onClick={() => this.title = 'Hello there'}>Change title</button>
            </div>
        );
    }
}