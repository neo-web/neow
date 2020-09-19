import { Directive, Registry } from '../directive';
import { scanDOMTree } from '../dom';

const $Value = Symbol();
const $Index = Symbol();

const replicate = (n: number, text: string) => {
  let temp = text
  let result = ''
  if (n < 1) return result
  while (n > 1) {
    if (n & 1) result += temp
    n >>= 1
    temp += temp
  }
  return result + temp
}

const repeatDirective: Directive = {
  attribute: (attr) => attr.nodeName === '#repeat' || attr.nodeName === `#foreach`,
  process: ({ targetNode, componentNode, attribute }) => {
    Promise.resolve().then(() => (targetNode.removeAttribute('#repeat'), targetNode.removeAttribute('#foreach')));
    const template = document.createElement('template') as HTMLTemplateElement;
    template.content.appendChild(targetNode.cloneNode(true));
    (template.content.firstChild as Element).removeAttribute('#repeat');
    (template.content.firstChild as Element).removeAttribute('#foreach');
    const hook = document.createComment('-repeat-');
    targetNode.parentNode!.insertBefore(hook, targetNode);
    targetNode.remove();
    const range = document.createRange();
    const clones: HTMLElement[] = [];
    let lastValue: any[] = [];
    let scratchPad: DocumentFragment | undefined;
    const handler = (value: Array<any> = [], sideEffect: Function = () => { }) => {
      // remove extra
      if (clones.length > value.length) {
        const rng = document.createRange();
        rng.setStartBefore(clones[value.length]);
        rng.setEndAfter(clones[clones.length - 1]);
        rng.deleteContents();
        rng.detach();
        clones.length = value.length;
      }

      if (lastValue.length < value.length) {
        const t = document.createElement('template');
        t.innerHTML = replicate(value.length - lastValue.length, template.innerHTML);
        scratchPad = document.createDocumentFragment();
        scratchPad.append(t.content);
      } else {
        scratchPad = undefined;
      }

      for (let i = 0; i < value.length; i++) {
        // update existing
        const clone = clones[i];
        if (clone) {
          const updater = (<any>clone)['$_$'] as Function;
          if ((<any>clone)[$Value] !== value[i] && updater) {
            (<any>clone)[$Value] = value[i];
            (<any>clone)['$_$']();
          }
        } else {
          // add missing
          const newClone = scratchPad!.children.item(i - lastValue.length) as HTMLElement;
          (<any>newClone)[$Value] = value[i];
          (<any>newClone)[$Index] = i;
          const { update } = scanDOMTree({
          root: newClone,
          element: componentNode as HTMLElement,
          customArguments: {
            value: () => (<any>newClone)[$Value],
            index: () => (<any>newClone)[$Index],
          }
          });
          (<any>newClone)['$_$'] = () => update('value');
          update();
        }
      }
      if (scratchPad) {
        clones.push(...(Array.from(scratchPad.children)) as HTMLElement[])
          range.setStartAfter(hook);
          range.collapse();
          range.insertNode(scratchPad);
      }
      lastValue = [...value];
      if (sideEffect) {
        sideEffect();
      }
      // const frag = document.createDocumentFragment();
      // if (lastValue.length < value.length) {
      //   frag.append(...clones.slice(lastValue.length));
      // }
    }
    handler.sideEffect = attribute.nodeName === '#repeat';
    return handler;
  }
}

Registry.register(repeatDirective);