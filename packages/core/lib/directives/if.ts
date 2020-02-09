import {Directive, Registry} from '../directive';
import {updateElement} from '../mixins/ComponentMixin';

const ifDirective: Directive = {
    attribute: (attr) => attr.nodeName === '#if',
    process: ({targetNode, componentNode}) => {
        const hook = document.createComment('-if-');
        targetNode.parentNode!.insertBefore(hook, targetNode);
        requestAnimationFrame(() => {
            updateElement(componentNode);
        })
        return (value: any) => {
            if (!!value) {
                hook.parentNode!.insertBefore(targetNode, hook);
            } else {
                targetNode.remove();
            }
        }
    }
}

Registry.register(ifDirective);