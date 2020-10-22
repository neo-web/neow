export {Injector} from './Injector';
export {ComponentMixin} from './mixins/ComponentMixin';
export {DependenciesMixin} from './mixins/DependenciesMixin';
export {Component} from './Component';
export { Directive, Registry } from './directive';

export declare type Constructor<T = {}> = new (...args: any[]) => T;
export declare type CustomElement<T> = new (...args: any[]) => T|Constructor<HTMLElement>;
