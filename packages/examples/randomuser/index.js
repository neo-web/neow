import {Component, Injector} from '../node_modules/@neow/core/dist/index.js';
import {RouterOutlet} from '../node_modules/@neow/components/dist/router.js';
import {StyleLoader} from '../node_modules/@neow/components/dist/styleloader.js';

class RandomUserService {
    async getUser(userId) {
        const res = await fetch('https://randomuser.me/api?results=1&seed=' + userId);
        const data = await res.json();
        return data.results[0];
    }
}
RandomUserService.instance = new RandomUserService();

Injector.define('userService', () => RandomUserService.instance);

class UserCard extends Component {

    constructor() {
        super();
        this.counter = 0;
        this.someData = Array(3000).fill('').map((x, i) => i);

        this.xdir = 'up';

        console.log(this.xdir);
        const fn = () => {
            console.log(this.xdir);
            if (this.xdir === 'stop') {
                console.log('DONE');
                return;
            }
            if (this.xdir === 'up') {
                this.addData();
            }
            if(this.xdir === 'down') {
                this.removeData();
            }
            if (this.someData.length === 1) {
                this.xdir = 'up';
            }
            if (this.someData.length === 20) {
              this.xdir = 'down';
            }
            console.log(this.someData.length);
            // setTimeout(() => fn(), 50);
        }
        fn();

        setTimeout(() => {
            this.someData = this.someData.map(x => Math.random());
        }, 730);
    }

    static get template () {return /*html*/ `
        <neo-style-loader src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"></neo-style-loader>
        <div>{{this.counter}}</div>
        <div #if="{{!this.userData}}">Loading...</div>
        <div #if="{{this.userData}}">
            <h1>Random User: {{this.userData.name.first}}, {{this.userData.name.last}} ({{this.getAttribute('user-id')}})</h1>
            <img onclick="{{this.notify()}}" title="{{this.userData.name.last}}" src="{{this.userData.picture.large}}">
        </div>
        <div onclick="{{this.addData()}}" #repeat="{{this.someData}}">Value: {{value}} - Index: {{index}} ----- {{this.userData.name.last}}</div>
    `;}

    static get requirements() { return ['userService']; }

    static get observedAttributes() { return ['user-id']; }

    notify() {
        this.xdir = 'stop';
        console.log('stop');
        this.userData = this.userData;
    }

    addData() {
        this.someData = [...this.someData, Math.random()];
    }

    removeData() {
        this.someData = this.someData.slice(0, -1);
    }

    attributeChangedCallback() {
        const userId = this.getAttribute('user-id');
        this.userData = undefined;
        if (userId) {
            setTimeout(async () => {
                this.userData = await this.dependencies.userService.getUser(userId);
                this.counter++;
                console.log(this.userData);
            }, 1500);
            
        }
    }
}

customElements.define('random-user', UserCard);