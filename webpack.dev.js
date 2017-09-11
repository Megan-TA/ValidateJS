const baseWebpackCfg = require('./webpack.config')
const merge = require('webpack-merge')
const webpack = require('webpack')

module.exports = merge(baseWebpackCfg, {
    // watch: true,
    devServer: {
        inline: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
})
