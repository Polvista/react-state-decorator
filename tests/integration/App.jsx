import React, {Component} from 'react';
import TrackTest from './TrackTest';
import MobxTest from './MobxTest';

export default class App extends Component {

    render() {
        return (
            <div>
                <TrackTest key={1} />
                <br />
                <div>Duplicate:</div>
                <br />
                <TrackTest key={2} />
                <br />
                <div>MobX:</div>
                <MobxTest />
            </div>
        );
    }
}