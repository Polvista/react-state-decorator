import {expect} from 'chai';
import {action} from '../../src';

describe('action tests', () => {

    describe('function call', () => {
        let calledWith;
        let func = (param1, param2) => {
            calledWith = [param1, param2];
            return param1 + param2;
        };

        let wrapped;
        let callResult;

        before(() => {
            wrapped = action(func);
            callResult = wrapped(5, 10);
        });

        it('should be function', () => expect(typeof wrapped).to.equal('function'));
        it('should pass params', () => expect(calledWith).to.eql([5, 10]));
        it('should return value', () => expect(callResult).to.eql(15));

    });

    describe('decorator', () => {
        let calledWith;
        let callResult;
        let contextValue;
        let bindedContextValue;

        class TestClass {

            context = 10;

            @action myMethod(param1, param2) {
                calledWith = [param1, param2];
                contextValue = this.context;
                return param1 + param2;
            }

            @action myMethod2() {
                bindedContextValue = this.context;
            }

            constructor() {
                this.myMethod2 = this.myMethod2.bind(this);
            }

        }

        before(() => {
            const instance = new TestClass();
            callResult = instance.myMethod(5, 10);
            instance.myMethod2();
        });

        it('should pass params', () => expect(calledWith).to.eql([5, 10]));
        it('should have correct context', () => expect(contextValue).to.eql(10));
        it('should have correct context after bind', () => expect(bindedContextValue).to.eql(10));
        it('should return value', () => expect(callResult).to.eql(15));

    });

});