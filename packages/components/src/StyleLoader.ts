type PromiseResolver = {
    resolve: Function,
    reject: Function
};

const styleCache: Record<string, Promise<string>> = {};
const promiseCache: Record<string, PromiseResolver> = {};

const createPromise = (namespace: string): Promise<string> => {
    if (typeof styleCache[namespace] === 'undefined') {
        styleCache[namespace] = new Promise((resolve, reject) => {
            promiseCache[namespace] = {
                resolve, reject
            };
        });
    }
    return styleCache[namespace];
};

const loadStyle = async (url: string) => {
    if (!url) {
        return;
    }
    if (!styleCache[url]) {
        createPromise(url);
        try {
            const r = await fetch(url);
            const t = await r.text();
            promiseCache[url].resolve(t);
    
        } catch (err) {
            console.warn('Could not load style from ' + url);
            promiseCache[url].reject(err);
        }
    }
    return styleCache[url];
}

export class StyleLoader extends HTMLElement {

    static get observedAttributes() {
        return ['src'];
    }

    async attributeChangedCallback() {
        this.innerHTML = '';
        if (this.hasAttribute('src')) {
            const style = await loadStyle(<string>this.getAttribute('src')); 
            this.innerHTML = `<style>${style}</style>`;
        }
    }
}

customElements.define('neo-style-loader', StyleLoader);