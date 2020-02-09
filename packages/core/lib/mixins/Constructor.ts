export declare type Constructor<T = InstanceType<any>> = {
    new(...args: any[]): T;
    prototype: T;
};