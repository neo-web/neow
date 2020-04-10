import {scanDOMTree} from '../dom';

const internals = Symbol('n-cmx');

export const updateElement = (target: HTMLElement | Element) => {
    console.log('updating', target);
    (<any>target)[internals]!.update('*');
};

export function ComponentMixin(BaseClass: typeof HTMLElement) {
    // @ts-ignore
    return class ComponentMixinClass extends BaseClass {
        [internals]: Record<string, any>;
        public static template = '';
        constructor() {
            super();
            this[internals] = {};
            const fragment:HTMLTemplateElement = document.createElement('template');
            fragment.innerHTML = (<any>this.constructor).template;
            const content = fragment.content.cloneNode(true);
            const shadow: ShadowRoot = (<any>this).attachShadow({mode: 'open'});
            const { paths, update } = scanDOMTree({
                root: content,
                element: this,
                directives: (<any>this.constructor).localDirectives || []
            })
            this[internals].update = update;
            shadow.appendChild(content);
            requestAnimationFrame(() => {
                paths.forEach(path => {
                    const key = path.slice(5);
                    let calculated: any = ((<any>this)[key]);
                    Object.defineProperty(this, key, {
                        set: (value) => {
                            calculated = value;
                            update(key);
                        },
                        get: () => calculated
                    });
                })
            });
        }
    } as typeof HTMLElement
}