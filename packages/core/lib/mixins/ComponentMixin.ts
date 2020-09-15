import { CustomElement } from '../index';

import { scanDOMTree } from '../dom';

const internals = Symbol('n-cmx');

export const updateElement = (target: HTMLElement | Element) => {
    console.log('updating', target);
    (<any>target)[internals]!.update('*');
};

export function ComponentMixin<TBase extends CustomElement<HTMLElement> = CustomElement<HTMLElement>>(BaseClass: TBase): TBase {
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
                element: this as unknown as HTMLElement,
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
                            update('this.'+key);
                            (this as unknown as HTMLElement).dispatchEvent(new CustomEvent(
                                '@property-change', {
                                detail: {
                                    property: key,
                                    value: value
                                }
                            }
                            ));
                        },
                        get: () => calculated
                    });
                })
            });
        }
    }
}