import React, {Component} from 'react';
import TrackTest from './TrackTest';
import MobxTest from './MobxTest';
import {track} from '../../src'
import LifecycleTest from './LifecycleTest'

export default class App extends Component {

    lifeCycleObj = {
        id: 1
    };

    @track showLifecycleTest = false;

    render() {
        return (
            <div>
                <TrackTest key={1} />
                <br />
                <div>Duplicate:</div>
                <br />
                <TrackTest key={2} />
                <br />
                <br />
                <button onClick={() => this.showLifecycleTest = !this.showLifecycleTest}>{this.showLifecycleTest ? 'hide lifecycle test' : 'show lifecycle test'}</button>
                <button onClick={() => this.lifeCycleObj.id++}>Update object</button>
                <button onClick={() => {this.lifeCycleObj = {id: 1}; this.forceUpdate();}}>Renew object</button>
                {this.showLifecycleTest && <LifecycleTest passed={this.lifeCycleObj} /> }
                <br />
                <br />
                <br />
                <br />
                <div>MobX:</div>
                <MobxTest />
            </div>
        );
    }
}