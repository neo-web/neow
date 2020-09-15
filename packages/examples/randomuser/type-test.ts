import { Component, ComponentMixin } from "@neow/core";

class C extends ComponentMixin(HTMLInputElement) {
  constructor () {
    super();
    this.hidden = false;
    this.value = String(4);
  }
}

class X extends Component {
  private template = '<h1>Hello</h1>';

  constructor () {
    super();
  }
}

customElements.define('x-a', X);

customElements.define('custom-input', C, {
  extends: 'input'
});