import {ComponentMixin, updateElement} from './mixins/ComponentMixin';
import {DependenciesMixin} from './mixins/DependenciesMixin';

export class Component extends (ComponentMixin(DependenciesMixin(HTMLElement))) {
    constructor() {
        super();
    }
    public requestUpdate() {
        requestAnimationFrame(() => {
            updateElement(<unknown>this as HTMLElement);
        })
    }
    public toString() {
        return this.constructor.name;
    }
}