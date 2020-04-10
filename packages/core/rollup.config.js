import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';
import sourcemaps from 'rollup-plugin-sourcemaps';

const common = {
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
        typescript({
            clean: true,
            typescript: require('typescript')
        })
    ]
};

if (process.env.NODE_ENV !== 'development') {
    console.log('Compiling in production');
    common.plugins.push(terser());
    common.plugins.push(sourcemaps());
}

export default {
    input: './lib/index.ts',
    treeshake: false,
    output: [{
        file: pkg.module,
        format: 'es',
    }],
    ...common
};