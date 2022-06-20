const path = require('path')

const HtmlWebPackPlugin = require('html-webpack-plugin')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    entry: [
        '@babel/polyfill',
        path.join(__dirname, 'client', 'style.css'),
        path.join(__dirname, 'client', 'src', 'start.js'),
    ],

    output: {
        path: path.join(__dirname, 'client', 'bundle'),
        filename: 'bundle.js',
    },
    performance: {
        hints: false,
    },
    devServer: {
        static: './client/public',

        proxy: {
            '/': {
                target: 'http://localhost:3001',
            },
        },
        port: '3000',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                        },
                    },
                ],
            },
            {
                test: /\.mp3$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                },
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                    },
                ],
            },
            { test: /\.xml$/, loader: 'xml-loader' },
        ],
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './client/index.html',
            filename: './index.html',
        }),
        new MiniCssExtractPlugin({
            filename: 'bundle.css',
        }),
    ],
}
