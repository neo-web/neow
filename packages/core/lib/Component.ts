import {ComponentMixin, updateElement} from './mixins/ComponentMixin';
import {DependenciesMixin} from './mixins/DependenciesMixin';

// @ts-ignore
export class Component extends ComponentMixin(DependenciesMixin(HTMLElement)) {
    constructor() {
        super();
    }
    public requestUpdate() {
        requestAnimationFrame(() => {
            updateElement(this);
        })
    }
}