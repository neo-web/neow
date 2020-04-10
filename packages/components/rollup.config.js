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

const files = ['Router', 'StyleLoader'];
const configs = files.map(srcFile => {
    return {
        input: path.resolve(__dirname, 'src', srcFile + '.ts'),
        treeshake: false,
        output: [
            {
                file: path.resolve(__dirname, 'dist', srcFile.toLocaleLowerCase() + '.js'),
                format: 'es',
            }
        ],
        ...common
    }
});

export default configs;