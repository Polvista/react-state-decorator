var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './tests/integration/index.jsx'
    },

    output: {
        path: '/',
        filename: '[name].js'
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['babel-loader']
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './tests/integration/index.html',
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