const stripCurlies = /(\{\{([^\{|^\}]+)\}\})/gi;

export interface ExpressionDescriptor {
    paths: string[];
    expression: string | null;
    expressions: string[]
};

export const parse = (expression: string, useThis = true): ExpressionDescriptor => {
    let match: RegExpExecArray | null;
    const paths: string[] = [];
    const regexp = useThis ? /(this\.[\w+|\d*]*)+/gi : /\{\{([\w+|\d*]+)+(\.\w+)*\}\}/gi;
    // @ts-ignore
    while (match = regexp.exec(expression)) {
        paths.push(match[1]);
    }
    return {
        paths,
        expression,
        expressions: paths.length ? expression.match(stripCurlies) || [] : []
    };
}