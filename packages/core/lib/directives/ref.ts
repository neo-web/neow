import type {Directive, IDirectiveRegistry} from '../directive';

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
        (<any>componentNode).constructor['internal.updateElement'](componentNode);
    }
}

export default function register(registry: IDirectiveRegistry) {
    registry.register(refDirective);
}
