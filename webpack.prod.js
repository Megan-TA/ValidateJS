const baseWebpackCfg = require('./webpack.config')
const merge = require('webpack-merge')
const webpack = require('webpack')

module.exports = merge(baseWebpackCfg, {
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            output: {
                comments: false
            },
            warning: false,
            sourceMap: true
        })
    ]
})
