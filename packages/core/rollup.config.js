import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';
import sourcemaps from 'rollup-plugin-sourcemaps';

const path = require('path');
const fs = require('fs');

const common = {
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
        typescript({
            clean: true,
            typescript: require('typescript'),
            tsconfigOverride: {
                declaration: false
            }
        })
    ]
};

if (process.env.NODE_ENV !== 'development') {
    console.log('Compiling in production');
    common.plugins.push(terser());
    common.plugins.push(sourcemaps());
}

const directivesPath = path.resolve(__dirname, './lib/directives');
const directivesFiles = fs.readdirSync(directivesPath)
    .filter(filename => {
        const filepath = path.resolve(directivesPath, filename);
        return !(fs.statSync(filepath).isDirectory());
    });

const directivesConfig = directivesFiles.map(filename => ({
    input: `./lib/directives/${filename}`,
    output: [{
        file: `./dist/${filename.slice(0, -3)}.js`,
        format: 'es',
        sourcemap: true
    }],
    ...common
}));

export default [
    {
        // CORE
        input: './lib/index.ts',
        output: [{
            file: pkg.module,
            format: 'es',
            sourcemap: true,
        }],
        ...common
    },
    ...directivesConfig
];