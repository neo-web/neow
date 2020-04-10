import {Directive, Registry, Component} from '@neow/core';

const template = require('./app.template.html');

class NeoApp extends Component {

    static template = template;

    private greeting = 'Hello';

    public items: any[] = [];

    connectedCallback() {
        setTimeout(() => this.items = [1, 2]);
    }
}

customElements.define('neo-app', NeoApp);