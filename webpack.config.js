'use strict';

const path = require('path');
const { author, version } = require('./package.json');

const _git = require('git-rev-sync');
function git(action, def=null) {
  try { return _git[action](); }
  catch (e) { /* ignore error */ }
  return def;
}

const revision = git('short');
const branch = git('branch');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlStringReplace = require('html-string-replace-webpack-plugin');

let baseConfig = {
  entry: [
    'bootstrap-loader',
    path.join(__dirname, './style/main.scss'),
    path.join(__dirname, './src')
  ],
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: 'babel-loader',
      exclude: path.join(__dirname, 'node_modules')
    }, {
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        use: ['css-loader'],
        fallback: 'style-loader'
      })
    }, {
      test: /\.scss$/,
      use: ExtractTextPlugin.extract({
        use: ['css-loader', 'sass-loader'],
        fallback: 'style-loader'
      })
    }, {
      test: /bootstrap-sass[\/\\]assets[\/\\]javascripts[\/\\]/,
      use: 'imports-loader?jQuery=jquery'
    }, {
      test: /\.(png|jpg|gif|svg)$/,
      loader: 'url-loader',
      query: {
        limit: 10000,
        name: '[name].[ext]?[hash]'
      }
    }, {
      test: /\.(woff2?|svg)$/,
      loader: 'url-loader',
      query: {
        limit: 10000
      }
    }, {
      test: /\.(ttf|eot)$/,
      use: 'file-loader'
    }]
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: 'assets',
      to: 'assets'
    }]),
    new HtmlStringReplace({
      enable: true,
      patterns: [{
          match: /{{\s*(\w*)\s*}}/g,
          replacement(_, key) {
            if (key === 'author') return author;
            if (key === 'year') return (new Date()).getFullYear();
            if (key === 'version') return revision ? `${version}-${revision} (${branch})` : version;
            return '';
          }
      }]
    }),
    new ExtractTextPlugin('style.css'),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    })
  ]
};

module.exports = env => {
  let config = Object.assign({}, baseConfig);
  if (env === 'dev') config.devtool = 'eval';
  return config;
};
