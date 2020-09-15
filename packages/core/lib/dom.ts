import {Directive, Registry} from './directive';
import {parse} from './parse';

const isPropogating = Symbol();

type Binders = Record<string | symbol, Function[]>;

const boundNodes = new WeakMap<HTMLElement, Array<Text | Attr | HTMLElement>>();

const addPath = (path: string, fn: Function, binders: Binders) => {
    if (binders[path]) {
        binders[path].push(fn);
    } else {
        binders[path] = [fn];
    }
}

const propagate = (binders: Binders, sideEffects: Function[] = []) => (key: string) => {
    // @ts-ignore
    if (binders[isPropogating]) {
        return;
    }
    requestAnimationFrame(() => {
        (key && key !== '*' ? [key] : Object.keys(binders)).forEach(path => {
            (binders[path] || []).forEach((fn) => {
              try {
                return fn();
              } catch (err) {
                return '';
              }
            });
        });
        if (binders['*']) {
            binders['*'].forEach(fn => fn());
        }
        // @ts-ignore
        binders[isPropogating] = false;
        sideEffects.forEach(fn => fn());
    });
}

type scanDOMTreeOptions = {
    root: Node;
    element: HTMLElement;
    directives?: Directive[];
    customArguments?: Record<string, any>
};

const CONTEXT = Symbol();

export const scanDOMTree = (options: scanDOMTreeOptions) => {
    const markedAttributesToRemove = new Set<Attr>();
    const { directives: localDirectives = [], root, element, customArguments = {} } = options;
    const directives = Registry.getDirectives().concat(localDirectives);
    const binders: Binders = {
        [isPropogating]: false
    };
    const sideEffects: Function[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    const argumentKeys = Object.keys(customArguments);
    const argumentValues = Object.values(customArguments);
    const enforceUseThis = argumentKeys.length === 0;
    let currentNode: Node | null = enforceUseThis ? walker.nextNode() : walker.currentNode;
    for (; currentNode; currentNode = walker.nextNode()) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
            (<any>currentNode)[CONTEXT] = root;
            const attributes = Array.from((currentNode as Element).attributes);
            attributes.forEach(attr => {
                const { expression, paths } = parse(attr.nodeValue || '', enforceUseThis);
                directives.forEach(directive => {
                    if ((typeof directive.attribute === attr.nodeName) || (directive.attribute as Function)(attr)) {
                        markedAttributesToRemove.add(attr);
                        const invocation = directive.process({
                            attribute: attr,
                            expression,
                            paths,
                            componentNode: element,
                            targetNode: attr.ownerElement as HTMLElement
                        });
                        if (invocation) {
                            const fn = new Function(...argumentKeys, `return (${(expression || '').slice(2, -2)});`)
                            let update = () => { };
                            paths.forEach(path => {
                                update = () => {
                                    const value = fn.call(element, ...argumentValues);
                                    invocation(value, () => {
                                        Promise.resolve().then(() => {
                                            debugger;
                                            Object.keys(binders).filter(key => key !== path).forEach(key => typeof binders[key] === 'function' && (binders[key] as unknown as Function)());
                                        });
                                    });
                                };
                                addPath(path, update, binders);
                                (element as any)['$$$'] = binders;
                            });
                            if (invocation.sideEffect) {
                                addPath('*', update, binders);
                            }
                        }
                    }
                });
                if (!(attr.nodeValue || '').includes('{{')) {
                    return;
                }
                if (expression) {
                    if (attr.nodeName.startsWith('on')) {
                        const eventName = attr.nodeName.slice(2);
                        const fn = new Function('event', ...argumentKeys, expression.slice(2, -2) + ';');
                        markedAttributesToRemove.add(attr);
                        (currentNode as HTMLElement).addEventListener(eventName, (event: Event) => {
                            fn.call(element, event, ...argumentValues);
                        });
                    } else {
                        paths.forEach(path => {
                            const fn = new Function(...argumentKeys, `return ${expression.slice(2, -2)};`);
                            addPath(path, () => attr.nodeValue = String(fn.call(element, ...argumentValues)), binders);
                        });
                    }
                }
                if (!attr.nodeName.startsWith('on')) {
                    attr.nodeValue = '';
                }
            });
            continue;
        } else if (!(currentNode.nodeValue || '').includes('{{')) {
            continue;
        }
        const { expression, expressions, paths } = parse(currentNode.nodeValue || '', enforceUseThis);
        if (expression) {
            const oText = currentNode.nodeValue || '';
            const map: Record<string, Function> = expressions.reduce((o: any, e) => {
                o[e] = new Function(...argumentKeys, `return ${e.slice(2, -2).trim()};`);
                return o;
            }, {});
            const node = currentNode as Text;
            const modify = () =>
                Object.keys(map).reduce((text, expression) => {
                    try {
                        const joinValue = map[expression].call(element, ...argumentValues);
                        let resolvedValue = (typeof joinValue === 'undefined') ? '' : joinValue;
                        return text.split(expression).join(resolvedValue);
                    } catch (err) {
                        return text.split(expression).join('');
                    }
                }, oText);
            paths.forEach(path => {
                addPath(path, () => node.data = modify(), binders);
                requestAnimationFrame(() => {
                    node.data = modify();
                });
            });
        }
    }
    requestAnimationFrame(() => {
        markedAttributesToRemove.forEach(attr => {
            if (attr.ownerElement)
              (<Element>attr.ownerElement).removeAttribute(attr.nodeName);
        });
    });
    return {
        paths: Object.keys(binders),
        update: propagate(binders, sideEffects),
    };
}