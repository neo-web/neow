import type {Directive, IDirectiveRegistry} from '../directive';

const propertyDirective: Directive = {
    attribute: (attr) => attr.nodeName.startsWith('[') && attr.nodeName.endsWith(']'),
    process: ({targetNode, attribute}) => {
        const prop = attribute.nodeName.slice(1, -1);
        const camelCased = prop.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
        return (value: any) => {
            (<any>targetNode)[camelCased] = value;
        }
    }
}

export default function register(registry: IDirectiveRegistry) {
    registry.register(propertyDirective);
}
