import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';
import sourcemaps from 'rollup-plugin-sourcemaps';
import path from 'path';

const common = {
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
        typescript({
            clean: true,
            typescript: require('typescript')
        }),
        sourcemaps(),
        terser(),
    ]
};

export default {
    input: './src/Router.ts',
    treeshake: false,
    output: [{
        file: './dist/router.js',
        format: 'es',
    }],
    ...common
};