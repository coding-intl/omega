const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

module.exports = {
  devtool: 'source-map',
  context: path.join(__dirname, 'test'),
  entry: [
    //'webpack-dev-server/client?http://localhost:3000',
    './index.js',
  ],
  output: {
    path: path.join(__dirname, 'dist', 'static'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  resolveLoader: {
    moduleExtensions: ['-loader']
  },
  plugins: [
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        use: [
          {loader: 'babel'}
        ],
      }
    ]
  }
};