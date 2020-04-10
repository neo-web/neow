import {Injector, Requirement} from '../Injector';

export function DependenciesMixin(BaseClass: any) {
    // @ts-ignore
    return class DependenciesMixinClass extends BaseClass {
        
        public dependencies: Record<string|symbol|number, any> = {};

        constructor() {
            super();
            ((<any>this.constructor).requirements || []).forEach((entry: Requirement) => {
                if (typeof entry === 'string') {
                    this.dependencies[entry] = Injector.resolve(entry);
                } else {
                    this.dependencies[entry.name] = Injector.resolve(entry.name, entry.data);
                }
            })
        }
    } as InstanceType<any>
}