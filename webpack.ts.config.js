var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './tests/ts-integration/index.tsx'
    },

    output: {
        path: '/',
        filename: '[name].js'
    },

    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loaders: ['babel-loader', 'ts-loader']
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './tests/ts-integration/index.html',
            filename: './index.html',
        })
    ],

    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.css']
    },

    devServer: {
        historyApiFallback: true,
        stats: 'minimal',
        inline: true,
        port: 8899,
    }
};