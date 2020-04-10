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
    }

    static get template () {return /*html*/`
        <neo-style-loader src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"></neo-style-loader>
        <div>{{this.counter}}</div>
        <div #if="{{!this.userData}}">Loading...</div>
        <div #if="{{this.userData}}">
            <h1>Random User: {{this.userData.name.first}}, {{this.userData.name.last}} ({{this.getAttribute('user-id')}})</h1>
            <img onclick="{{this.notify()}}" title="{{this.userData.name.last}}" src="{{this.userData.picture.large}}">
        </div>
    `;}

    static get requirements() { return ['userService']; }

    static get observedAttributes() { return ['user-id']; }

    notify() {
        alert('kuku');
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