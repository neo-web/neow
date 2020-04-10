type DirectiveRegister = (directive: Directive) => void;

interface DirectiveOptions<T = any> {
    targetNode: Element | HTMLElement;
    componentNode: Element | HTMLElement;
    attribute: Attr;
    expression: string | null;
    paths: string[]
}

export interface Directive<T = any> {
    attribute: string | ((attr: Attr) => any);
    process: (options: DirectiveOptions<T>) => Function|void;
    registerAsGlobal?: (register: DirectiveRegister|undefined) => void;
}

class DirectiveRegistry {
    private directives: Set<Directive> = new Set();
    public register(directive: Directive) {
        this.directives.add(directive);
    }
    public getDirectives(): Directive[] {
        return Array.from(this.directives);
    }
}

export const Registry = new DirectiveRegistry();