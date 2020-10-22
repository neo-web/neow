import { expect, fixture } from '@open-wc/testing';
import {Component, Registry} from '../dist/index.js';
import initProp from '../dist/property.js';

initProp(Registry);

const Unit = () => class extends Component {
    static template = /*html*/`
    <h1>Title</h1>
    <input [value]="{{this.someValue}}" type="text">
    `;

    constructor() {
        super();
        this.someValue = 'initialValue';
    }
};

const ParentUnit = (childTag) => class extends Component {
    static template = /*html*/`
    <h1>Title</h1>
    <${childTag} [some-value]="{{this.baseValue}}"></${childTag}>
    `;

    constructor() {
        super();
        this.baseValue = 'parentValue';
    }
}

describe('Directive: Property injection', () => {
    it('Should inject property', async () => {
        const TAG = 'ut-prop-inj-1';
        customElements.define(TAG, Unit());
        const el = await fixture(`<${TAG}></${TAG}>`);
        expect(el.shadowRoot.querySelector('input').value).to.equal('initialValue');
    });

    it('Should update property', async () => {
        const TAG = 'ut-prop-inj-2';
        customElements.define(TAG, Unit());
        const el = await fixture(`<${TAG}></${TAG}>`);
        expect(el.shadowRoot.querySelector('input').value).to.equal('initialValue');
        el.someValue = 'updatedValue';
        expect(el.shadowRoot.querySelector('input').value).to.equal('updatedValue');
    });

    it('Should update nested properties', async () => {
        const TAG = 'ut-prop-inj-3';
        customElements.define(TAG, Unit());
        const parent = ParentUnit(TAG);
        customElements.define('ut-prop-inj-3-parent', parent);
        const el = await fixture('<ut-prop-inj-3-parent></ut-prop-inj-3-parent>');
        const childEl = el.shadowRoot.querySelector(TAG);
        expect(childEl.shadowRoot.querySelector('input').value).to.equal('parentValue');
        el.baseValue = 'updatedValue';
        expect(childEl.shadowRoot.querySelector('input').value).to.equal('updatedValue');
    });
});