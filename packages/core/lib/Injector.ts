export type Requirement = string | {
    name: string,
    data: any
}

class InjectionHandler {
    private injectors: Record<string, Function> = {};

    public define(name: NonNullable<any>, factory: Function): InjectionHandler {
        if (typeof this.injectors[name] !== 'undefined') {
            throw new Error('Cannot redefine existing injection ' + name);
        }
        this.injectors[name] = factory;
        return this;
    }

    public resolve<T = any>(name: string, data: any = undefined): T {
        const resolution = this.injectors[name];
        if (typeof resolution !== 'undefined') {
            return resolution(data) as T;
        }
        throw new Error('Cannot inject nonexisting dependency ' + name);
    }
}

export const Injector = new InjectionHandler();