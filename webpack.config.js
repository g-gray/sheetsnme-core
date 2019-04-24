'use strict'

const fs      = require('fs')
const pt      = require('path')
const webpack = require('webpack')

const FlowWebpackPlugin = require('flow-webpack-plugin')
const NodemonPlugin     = require('nodemon-webpack-plugin')

const PROD    = process.env.NODE_ENV === 'production'
const SRC_DIR = pt.resolve(__dirname, 'src')
const OUT_DIR = pt.resolve(__dirname, 'app/build')

const nodeModules = {}
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod
  })

module.exports = {
  mode: process.env.NODE_ENV || 'development',

  target: 'node',

  entry: {
    index: pt.join(SRC_DIR, 'index.js'),
  },

  output: {
    path: OUT_DIR,
    filename: '[name].js',
    libraryTarget: 'commonjs-module',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: SRC_DIR,
        exclude: /node_modules/,
        use: {loader: 'babel-loader', options: babelOptions()},
      },
    ],
  },

  externals: nodeModules,

  plugins: [
    // new webpack.IgnorePlugin(/\.(css|less)$/),
      ...(PROD ? [] : [
      new webpack.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: false,
      }),
      new NodemonPlugin({watch: OUT_DIR}),
    ]),
    new FlowWebpackPlugin(),
  ],

  devtool: 'cheap-eval-source-map',

  // stats: {
  //   colors: true,
  //   chunks: false,
  //   version: false,
  //   hash: false,
  //   assets: false,
  // },
}

function babelOptions() {
  return {
    presets: [
      ['@babel/preset-env', {
        targets: {node: 'current'},
        // Don't generate useless garbage
        loose: true,
      }],
      '@babel/preset-flow',
    ],
    plugins: [
      // Emits a special annotation just before a class-defining IIFE, marking
      // it as side-effect-free. Allows UglifyJS to remove unused classes
      // generated from our code by Babel. Doesn't affect library code. Must
      // precede other class transforms. May require module concatenation.
      // References:
      //   * https://github.com/mishoo/UglifyJS2/issues/1261
      //   * https://github.com/babel/babel/issues/5632
      //   * https://github.com/babel/babel/pull/6209
      //   * https://github.com/blacksonic/babel-webpack-tree-shaking
      // () => ({
      //   visitor: {
      //     ClassExpression(path) {
      //       path.addComment('leading', '#__PURE__')
      //     },
      //   },
      // }),
    ],
  }
}
