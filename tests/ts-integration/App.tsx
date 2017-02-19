import * as React from  'react';
import {TrackTest} from "./TrackTest";

export class App extends React.Component<{}, {}> {
    render() {
        return (
            <div>
                <TrackTest key={1} />
                <br />
                <div>Duplicate:</div>
                <br />
                <TrackTest key={2} />
            </div>
    );
    }
}