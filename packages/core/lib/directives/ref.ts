import {Directive, Registry} from '../directive';
import {updateElement} from '../mixins/ComponentMixin';

const refDirective: Directive = {
    attribute: (attr) => attr.nodeName === '#ref',
    process: ({attribute, targetNode, componentNode}) => {
        const key = attribute.nodeValue;
        if (typeof key === 'string') {
            const root = componentNode as any;
            root.$ = root.ref = {
                ...(root.ref || {}),
                [key]: targetNode
            }
        }
        updateElement(componentNode);
    }
}

Registry.register(refDirective);
