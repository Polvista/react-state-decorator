import HtmlWebpackPlugin from 'html-webpack-plugin';
import merge from 'webpack-merge';
import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const isProdBuild = process.env.NODE_ENV == 'production';

const webpackCommon = {
    entry: {
        app: './tests/ts-integration/index.tsx'
    },

    output: {
        path: path.resolve(__dirname, 'build/ts-integration'),
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
};

const webpackDev = {
    devServer: {
        historyApiFallback: true,
        stats: 'minimal',
        inline: true,
        port: 8899,
    },

    resolve: {
        alias: {
            api: path.resolve(__dirname, './src')
        }
    }
};

const webpackProd = {

    resolve: {
        alias: {
            api: path.resolve(__dirname, 'build/lib/index.min.js')
        }
    }
};

module.exports = isProdBuild ? merge(webpackCommon, webpackProd) : merge(webpackCommon, webpackDev);