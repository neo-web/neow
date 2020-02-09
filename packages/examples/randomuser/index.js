import {Component, Injector} from '../node_modules/@neow/core/dist/index.js';

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
    }

    static template = `
        <div #if="{{!this.userData}}">Loading...</div>
        <div #if="{{this.userData}}">
            <h1>Random User: {{this.userData.name.first}}, {{this.userData.name.last}}</h1>
            <img title="{{this.userData.name.last}}" src="{{this.userData.picture.large}}">
        </div>
    `;

    static requirements = ['userService'];

    static observedAttributes = ['user-id'];

    attributeChangedCallback() {
        const userId = this.getAttribute('user-id');
        this.userData = undefined;
        if (userId) {
            setTimeout(async () => {
                this.userData = await this.dependencies.userService.getUser(userId);
                console.log(this.userData);
            }, 1500);
            
        }
    }
}

customElements.define('random-user', UserCard);