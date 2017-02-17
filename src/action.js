import {globalState} from './globalState';
import classPropertyDecorator from './classPropertyDecorator';
import {addHiddenProp} from './utils';

export function action(arg1) {
    if(arg1 == null)
        throw new Error('Provide function for action');

    if (arguments.length === 1 && typeof arg1 === "function")
        return createAction(arg1);

    return createActionDecorator.apply(null, arguments);
}

function createActionDecorator(target, prop, descriptor) {
    if (descriptor && typeof descriptor.value === "function") {
        // Mobx comment:
        // TypeScript @action method() { }. Defined on proto before being decorated
        // Don't use the field decorator if we are just decorating a method
        descriptor.value = createAction(descriptor.value);
        descriptor.enumerable = false;
        descriptor.configurable = true;
        return descriptor;
    }

    return classPropertyDecorator(
        target,
        prop,
        descriptor,
        function initialize(instance, value) {
            addHiddenProp(target, prop, createAction(value));
        },
        function get() {
            return this[prop];
        },
        function set(v) {
            throw new Error('Attempt to change @action method');
        }
    );
}

function createAction(func) {
    return function() {
        globalState.startedActions++;

        try {
            return func.apply(this, arguments);
        } finally {
            globalState.startedActions--;
            if(0 === globalState.startedActions) {
                globalState.afterActionsEndedCallbacks.forEach(cb => cb());
                globalState.afterActionsEndedCallbacks = [];
            }
        }
    }
}