/* eslint-disable no-useless-escape,no-dupe-keys */
var path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
    entry: {
        main: path.resolve(__dirname, 'src/index.js'),
        vendor: ['jquery']
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader!stylus-loader'
                })
            },
            {
                test: /\.styl$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015', 'stage-1'],
                        plugins: [
                            'transform-runtime'
                        ]
                    }
                }
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(csv|tsv)$/,
                use: [
                    'csv-loader'
                ]
            },
            {
                test: /\.xml$/,
                use: [
                    'xml-loader'
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            'lib': path.join(__dirname, '/src/lib'),
            'css': path.join(__dirname, '/src/css'),
            'es6': path.join(__dirname, '/src/es6')
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'webpack',
            filename: 'index.html',
            template: './src/index.html',
            inject: 'head',
            favicon: '',
            hash: false
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['vendor', 'manifest']
        }),
        new webpack.ProvidePlugin({
            $: 'jquery'
        }),
        new ExtractTextPlugin('styles.css'),
        new CleanWebpackPlugin(
            ['dist/*.bundle.js', 'dist/*.bundle.js.map', 'dist/chunk/*'],
            {
                root: __dirname,
                verbose: false,
                dry: false,
                exclude: ['dist/vendor.*.js']
            }
        )
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        chunkFilename: 'chunk/[name].[chunkhash].js',
        sourceMapFilename: '[file].map'
    }
}
