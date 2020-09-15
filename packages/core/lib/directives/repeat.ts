import { Directive, Registry } from '../directive';
import { scanDOMTree } from '../dom';

const repeatDirective: Directive = {
  attribute: (attr) => attr.nodeName === '#repeat',
  process: ({ targetNode, componentNode }) => {
    Promise.resolve().then(() => targetNode.removeAttribute('#repeat'));
    const template = document.createElement('template') as HTMLTemplateElement;
    template.content.appendChild(targetNode.cloneNode(true));
    (template.content.firstChild as Element).removeAttribute('#repeat');
    const hook = document.createComment('-repeat-');
    targetNode.parentNode!.insertBefore(hook, targetNode);
    targetNode.remove();
    const clones: HTMLElement[] = [];
    const updateMap = new Map<HTMLElement, Function>();
    const handler = (value: Array<any> = []) => {
      const dataLength = value.length;
      // remove extra
      if (clones.length > value.length) {
        clones.slice(value.length).forEach(clone => {
          clone.remove();
          updateMap.delete(clone);
        })
        clones.length = value.length;
      }

      // process existing
      for (let i = 0; i < dataLength; i++) {
        const clone = clones[i];
        if (clone) {
          try {
            const updater = updateMap.get(clone);
            if (updater) {
              updater('*');
            }
          } catch (err) {
            console.log(err);
          }
        } else {
          // add missing
          const clone = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
          requestAnimationFrame(() => {
            hook.parentNode!.insertBefore(clone, hook);
          });
          const { update } = scanDOMTree({
          root: clone,
          element: componentNode as HTMLElement,
          customArguments: {
            value: value[i],
            index: i
            }
          });
          updateMap.set(clone, update);
          clones.push(clone);
        }
      }
    }
    handler.sideEffect = true;
    return handler;
  }
}

Registry.register(repeatDirective);