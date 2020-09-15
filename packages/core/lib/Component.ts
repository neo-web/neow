import {ComponentMixin, updateElement} from './mixins/ComponentMixin';
import { DependenciesMixin } from './mixins/DependenciesMixin';

export const NEOW_COMPONENT = Symbol();

export class Component extends (ComponentMixin(DependenciesMixin(HTMLElement))) {

    constructor() {
        super();
    }

    static get [NEOW_COMPONENT]() { return true; }

    public requestUpdate() {
        requestAnimationFrame(() => {
            updateElement(this);
        })
    }
    public toString() {
        return this.constructor.name;
    }
}