import React, {Component} from 'react';
import {state} from 'api';

export default class LifecycleTest extends Component {

    @state constr = 0;
    @state willMount = 0;
    @state didMount = 0;
    @state willUpdate = 0;
    @state didUpdate = 0;
    @state willUnmount = 0;

    @state passedProp;

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