import { fixture, expect } from '@open-wc/testing';
import { Component } from '../dist/index.js';

const Unit = () => class extends Component {
    static template = /*html*/`<h1>My name is {{this.myName}}</h1>`;
    constructor() {
        super();
        this._myName = 'FAIL';
    }

    get myName() {
        return this._myName;
    }

    set myName(v) {
        this._myNameClone = v;
        this._myName = v;
    }
}

describe('property-change', () => {
    describe('Template update', () => {
        it('Should update template', async () => {
            const TAG = 'ut-prop-chg-1';
            customElements.define(TAG, Unit());
            const el = await fixture(`<${TAG}></${TAG}>`);
            expect(el.shadowRoot.innerHTML).to.equal('<h1>My name is FAIL</h1>');
        })
    });
    describe('Event emitting', () => {
        const TAG = 'ut-prop-chg-2';
        customElements.define(TAG, Unit());
        it('Should emit event', async () => {
            const el = await fixture(`<${TAG}></${TAG}>`);
            const handler = (event) => {
                const { detail} = event;
                expect(detail.property).to.equal('myName');
                expect(detail.value).to.equal('PASS');
            };
            el.addEventListener('@property-change', handler)
            el.myName = 'PASS';
            el.removeEventListener('@property-change', handler);
        });
        it('Should preserve original setter', async () => {
            const el = await fixture(`<${TAG}></${TAG}>`);
            expect(el._myNameClone).to.equal(undefined);
            const handler = () => {
                expect(el._myNameClone).to.equal('PASS');
            };
            el.addEventListener('@property-change', handler)
            el.myName = 'PASS';
            el.removeEventListener('@property-change', handler);
        });
    });
});