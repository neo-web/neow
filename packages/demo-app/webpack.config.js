// @ts-nocheck

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const fs = require('fs');

const isDevelopment = String(process.env.NODE_ENV).toLowerCase() === 'development';
const distFolder = path.resolve(__dirname, 'dist');
const srcFolder = path.resolve(__dirname, 'src');

const typescriptSrcRoot = path.resolve(srcFolder, 'app.ts');
const javascriptSrcRoot = path.resolve(srcFolder, 'app.js');

const entry = fs.existsSync(typescriptSrcRoot) ? typescriptSrcRoot : javascriptSrcRoot;

if (isDevelopment) {
    console.warn('Compiling DEVELOPMENT MODE...');
} else {
    console.info('Compiling production mode...');
}

module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    entry,
    output: {
        path: distFolder,
        filename: 'app-[chunkhash].js'
    },
    devServer: {
        contentBase: distFolder,
        compress: true,
        port: 1337,
        proxy: {}
    },
    devtool: isDevelopment ? 'source-map' : undefined,
    target: 'web',
    module: {
        rules: [
            { test: /\.ts$/, loaders: ['babel-loader', 'ts-loader'], sideEffects: true },
            { test: /\.js$/, loaders: ['babel-loader'], sideEffects: true },
            { test: /\.html$/, loader: 'html-loader' },
        ]
    },
    plugins: [
        new CopyWebpackPlugin([]),
        new HTMLWebpackPlugin({
            cache: false,
            template: './src/index.ejs',
            templateParameters: {
                pageTitle: 'neoweb app'
            }
        })
    ]
};