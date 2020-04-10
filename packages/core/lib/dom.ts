import {Directive, Registry} from './directive';
import {ExpressionDescriptor, parse} from './parse';

type Binders = Record<string, Function[]>;

const addPath = (path: string, fn: Function, binders: Binders) => {
    if (binders[path]) {
        binders[path].push(fn);
    } else {
        binders[path] = [fn];
    }
}

const propagate = (binders: Binders) => (key: string) => {
    Object.keys(binders).forEach(path => {
        if (key === '*' || path.startsWith('this.' + key)) {
            binders[path].forEach(fn => {
                try {
                    return fn();
                } catch (err) {
                    return '';
                }
            });
        }
    });
}

type scanDOMTreeOptions = {
    root: Node;
    element: HTMLElement;
    directives?: Directive[];
};

export const scanDOMTree = (options: scanDOMTreeOptions) => {
    const { directives: localDirectives = [], root, element } = options;
    const directives = Registry.getDirectives().concat(localDirectives);
    const binders: Binders = {};
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let currentNode: Node|null;
    while (currentNode = walker.nextNode()) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
            const attributes = Array.from((currentNode as Element).attributes);
            attributes.forEach(attr => {
                const { expression, paths } = parse(attr.nodeValue || '');
                directives.forEach(directive => {
                    if ((typeof directive.attribute === attr.nodeName) || (directive.attribute as Function)(attr)) {
                        requestAnimationFrame(() => {
                            (<Element>attr.ownerElement).removeAttribute(attr.nodeName);
                        });
                        const invocation = directive.process({
                            attribute: attr,
                            expression,
                            paths,
                            componentNode: element,
                            targetNode: attr.ownerElement as HTMLElement
                        });
                        if (invocation) {
                            const fn = new Function(`return (${(expression || '').slice(2, -2)});`)
                            paths.forEach(path => {
                                addPath(path, () => {
                                    const value = fn.call(element);
                                    invocation(value);
                                }, binders);
                            });
                        }
                    }
                });
                if (!(attr.nodeValue || '').includes('{{')) {
                    return;
                }
                if (expression) {
                    if (attr.nodeName.startsWith('on')) {
                        const eventName = attr.nodeName.slice(2);
                        const fn = new Function(`event`, expression.slice(2, -2) + ';');
                        (currentNode as HTMLElement).removeAttribute(attr.nodeName);
                        (currentNode as any)['on' + eventName] = (event: Event) => {
                            fn.call(element, event);
                        };
                    } else {
                        paths.forEach(path => {
                            const fn = new Function(`return ${expression.slice(2, -2)};`);
                            addPath(path, () => attr.nodeValue = String(fn.call(element)), binders);
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
        const { expression, expressions, paths } = parse(currentNode.nodeValue || '');
        if (expression) {
            const oText = currentNode.nodeValue || '';
            const map: Record<string, Function> = expressions.reduce((o: any, e) => {
                o[e] = new Function(`return ${e.slice(2, -2).trim()};`);
                return o;
            }, {});
            const node = currentNode as Text;
            const modify = () =>
                Object.keys(map).reduce((text, expression) => {
                    try {
                        const joinValue = map[expression].call(element);
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
    return {
        paths: Object.keys(binders),
        update: propagate(binders)
    };
}