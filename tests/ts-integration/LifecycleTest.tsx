import * as React from 'react';
import {track} from '../../src';

export class LifecycleTest extends React.Component<{passed: any}, {}> {

    @track constr = 0;
    @track willMount = 0;
    @track didMount = 0;
    @track willUpdate = 0;
    @track didUpdate = 0;
    @track willUnmount = 0;

    @track passedProp;

    constructor(props) {
        super(props);
        console.log('constructor');
        this.constr++;
        this.passedProp = props.passed;
    }

    componentWillMount() {
        console.log('componentWillMount');
        this.willMount++;
    }

    componentDidMount() {
        console.log('componentDidMount');
        this.didMount++;
    }

    componentWillReceiveProps(nextProps) {
        console.log('componentWillReceiveProps');
        this.passedProp = nextProps.passed;
    }

    componentWillUpdate() {
        console.log('componentWillUpdate');
        if(!this.willUpdate)
            this.willUpdate++;
    }

    componentDidUpdate() {
        console.log('componentDidUpdate');
        if(!this.didUpdate)
            this.didUpdate++;
    }

    componentWillUnmount() {
        console.log('componentWillUnmount');
        this.willUnmount++;
    }

    render() {
        console.log('lifecycle render');
        return (
            <div>
                constructor: {this.constr} <br />
                willMount: {this.willMount} <br />
                didMount: {this.didMount} <br />
                willUpdate: {this.willUpdate} <br />
                didUpdate: {this.didUpdate} <br />
                willUnmount: {this.willUnmount} <br />
                passedProp: {this.passedProp && this.passedProp.id}
            </div>
        );
    }

}