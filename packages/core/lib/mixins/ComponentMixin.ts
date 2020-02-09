import {scanDOMTree} from '../dom';
import { Constructor } from './Constructor';

export const updateElement = (target: HTMLElement|Element) => {
    (<any>target).__componentMixinInternals!.update('*');
};

export function ComponentMixin<T extends HTMLElement>(BaseClass: Constructor<T>) {
    // @ts-ignore
    return class ComponentMixinClass extends BaseClass {
        __componentMixinInternals: Record<string, any>;
        public static template = '';
        constructor() {
            super();
            this.__componentMixinInternals = {};
            const fragment:HTMLTemplateElement = document.createElement('template');
            fragment.innerHTML = (<any>this.constructor).template;
            const content = fragment.content.cloneNode(true);
            const shadow: ShadowRoot = this.attachShadow({mode: 'open'});
            const { paths, update } = scanDOMTree(content, this, []);
            this.__componentMixinInternals.update = update;
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
    };
}