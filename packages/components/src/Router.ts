export type RouteInfo = {
    path: string,
    basePath: string,
    params: Record<string, string>,
    queryParams: Record<string, string>,
};

class RouterServiceClass {

    public static instance = new RouterServiceClass();
    private routeInfo: RouteInfo|null = null;
    private outlets: Set<RouterOutlet> = new Set();

    constructor() {
        window.addEventListener('popstate', this.handlePopState.bind(this));
        this.handlePopState();
    }

    public register(outlet: RouterOutlet) {
        this.outlets.add(outlet);
        this.handlePopState();
    }

    public unregister(outlet: RouterOutlet) {
        this.outlets.delete(outlet);
        outlet.dispose();
    }

    private handlePopState() {
        const newHash = (window.location.href.split('#')[1] || '').split('?')[0];
        const urlParams = (window.location.href.split('?')[1] || '').split('&');
        const parts = newHash.split('/').slice(1);
        this.outlets.forEach(outlet => {
            const {pattern} = outlet;
            const patternParts = pattern.split('/').slice(1);
            if (patternParts[0] !== parts[0]) {
                outlet.dispose();
                return;
            }
            const params: any = {};
            const qParams: any = {};
            patternParts.forEach((part, idx) => {
                if (parts[idx] && patternParts[idx].startsWith(':')) {
                    params[patternParts[idx].substr(1)] = decodeURIComponent(parts[idx]);
                }
            });
            urlParams.forEach(param => {
                const eqIndex = param.indexOf('=');
                if (eqIndex > 0) {
                    const pName = param.slice(0, eqIndex);
                    const pValue = param.slice(eqIndex + 1);
                    qParams[pName] = decodeURIComponent(pValue);
                } else {
                    qParams[param] = true;
                }
            })
            this.routeInfo = {
                basePath: newHash.split('/')[0] || newHash.split('/')[1],
                path: newHash,
                params,
                queryParams: qParams
            };
            outlet.process(this.routeInfo);
        })
    }
}

export const RouterService = RouterServiceClass.instance;


export class RouterOutlet extends HTMLElement {
    private routerService = RouterService;
    private slotEl: HTMLSlotElement;
    private componentEl: HTMLElement|undefined = undefined;

    static template = /*html*/`<slot name="HIDDEN"></slot>`
    
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'closed'});
        shadow.innerHTML = RouterOutlet.template;
        this.slotEl = shadow.querySelector('slot') as HTMLSlotElement;
    }

    public get pattern() {
        return this.getAttribute('pattern') || 'INVALID';
    }

    connectedCallback() {
        this.routerService.register(this);
    }

    disconnectedCallback() {
        this.routerService.unregister(this);
    }

    private createComponent(componentTagName: string) {
        const component = document.createElement(componentTagName);
        return component;
    }

    private updateAttributes(attributeSet: Record<string, string> = {}) {
        const component = this.componentEl;
        
        if (component) {
            Object.entries(attributeSet).forEach(([key, value]) => {
                component.setAttribute(key, value);
            });
        }

    }

    process(routeInfo: RouteInfo) {
        this.slotEl.setAttribute('name', 'router-outlet');
        const componentTagName = this.getAttribute('component');
        const attributeSet:Record<string, string> = {};
        if (!this.componentEl && componentTagName) {
            try {
                this.componentEl = this.createComponent(componentTagName);
                this.componentEl.setAttribute('slot', 'router-outlet');
                this.appendChild(this.componentEl);
                
            } catch (err) {
                console.error(err);
            }
        }
        if (this.componentEl) {
            Array.from(this.attributes).forEach(attr => {
                if (attr.nodeName.startsWith('attribute:')) {
                    const attributeName = attr.nodeName.slice(10);
                    const value = attr.nodeValue || '';
                    if (value.startsWith(':')) {
                        attributeSet[attributeName] = routeInfo.params[value.slice(1)];
                    } else {
                        attributeSet[attributeName] = attr.nodeValue || '';
                    }
                }
            });
            this.updateAttributes(attributeSet);
        }
    }

    dispose() {
        if (this.componentEl) {
            this.componentEl.remove();
        }
        this.componentEl = undefined;
        this.slotEl.setAttribute('name', '$$HIDDEN$$')
    }
}

customElements.define('neo-router', RouterOutlet);