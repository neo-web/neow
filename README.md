# neow
Fast and Super-slim front-end microframework.

![](https://badgen.net/bundlephobia/minzip/@neow/core@latest?icon=npm) ![CI](https://github.com/neo-web/neow/workflows/CI/badge.svg)

## Features:
- Components (Web-Components based) - declarative markup + directives
- Dependency Injection / Injectors
- Routing
- Directives are opt-in, minimum bundle size.
- Built in directives
  - conditional `#if`
  - reference `#ref`
  - property-injection `[%propname%]`
  - repeat / for-each
  - Extensible: Add your own directives (local / global)

## Roadmap:
- Richer directives optional library
- Nested routers
- Syntactic sugar (transpiler)

# Example
```javascript
import { Component } from "@neow/core";

class MyCounter extends Component {
  static template = /*html*/ `
    <button onclick="{{this.counterValue--}}">-</button>
    <span>{{this.counterValue}}</span>
    <button onclick="{{this.counterValue++}}">+</button>
  `;

  counterValue = 0;
}

customElements.define("my-counter", MyCounter);
```

# Opt-in for directives
Run this only once, directives are globally declared across the app.
```javascript
import { Component, Registry } from '@neow/core';
import registerIf from '@neow/core/if';

registerIf(Registry);

class ToggleMe extends Component {
  isOn = true;
  
  static template = /*html*/`
  <button onclick="{{this.isOn = !this.isOn}}">Click to toggle</button>
  <span #if="{{this.isOn}}">Now you see me</span>
  `;
}

```

# Other directives
## ref
When registered, you are able to access directly dom elements from the component.
```javascript
import { Component, Registry } from '@neow/core';
import registerRef from '@neow/core/ref';
registerRef(Registry);

class extends Component {

  static template = `
    <h1>Hello</h1>
    <span #ref="mySpan"></span>
  `;
  
  someFunction() {
    this.$.mySpan.textContent = 'Great Success';
  }
}
```

## repeat / foreach
```html
<table>
  <thead>
    <th>#</th>
    <th>Title</th>
    <th>Price</th>
    <th>In Stock</th>
  </thead>
  <tbody>
  <tr #foreach={{this.items}}>
    <td>{{index}}</td>
    <td>{{value.title</td>
    <td>{{value.price}} {{value.currency}}</td>
    <td>{{this.inStock(value) ? 'Yes' : 'No'}}></td>
  </tr>
  </tbody>
</table>
```

## property
```html
<element-from-another-library [some-prop]="{{this.calculateSomething()}}"></element-from-another-library>
<!-- This will update the property "someProp" on the child element -->
```
