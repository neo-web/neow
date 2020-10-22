import type { Directive, IDirectiveRegistry } from '../directive';

const ifDirective: Directive = {
    attribute: (attr) => attr.nodeName === '#if',
    process: ({targetNode}) => {
        const hook = document.createComment('-if-');
        targetNode.parentNode!.insertBefore(hook, targetNode);
        return (value: any) => {
            if (!!value) {
                hook.parentNode!.insertBefore(targetNode, hook);
            } else {
                targetNode.remove();
            }
        }
    }
}

export default function register(registry: IDirectiveRegistry) {
    registry.register(ifDirective);
}