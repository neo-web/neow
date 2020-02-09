const stripCurlies = /(\{\{([^\{|^\}]+)\}\})/gi;

export interface ExpressionDescriptor {
    paths: string[];
    expression: string | null;
    expressions: string[]
};

export const parse = (expression: string): ExpressionDescriptor => {
    let match: RegExpExecArray | null;
    const paths: string[] = [];
    const regexp = /(this\.[\w+|\d*]*)+/gi;
    while (match = regexp.exec(expression)) {
        paths.push(match[1]);
    }
    return {
        paths,
        expression,
        expressions: paths.length ? expression.match(stripCurlies) || [] : []
    };
}