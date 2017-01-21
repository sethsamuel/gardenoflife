'use strict';
const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || '8888';

let plugins = [];
if (process.env.NODE_ENV !== 'production') {
  plugins = plugins.concat([new webpack.NoErrorsPlugin(), new webpack.HotModuleReplacementPlugin()]);
}

plugins = plugins.concat(new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'dev'),
    APP_ENV: JSON.stringify(process.env.APP_ENV || 'local')
  }
}));

plugins = plugins.concat(new CopyWebpackPlugin([
  {
    from: 'src/assets',
    to: 'assets'
  },
  {
    from: 'src/assets/favicon.ico',
    to: 'favicon.ico'
  }
]));

plugins = plugins.concat(new HtmlWebpackPlugin({
    chunks: ['index'],
    template: 'src/index.pug',
    filename: 'index.html'
  })
);

function entryPoint(entry) {
  return ((process.env.NODE_ENV !== 'production') ? [
    `webpack-dev-server/client?http://${HOST}:${PORT}`, // WebpackDevServer host and port
    'webpack/hot/only-dev-server'
    ] : [])
    .concat([`./src/${entry}.js`]);
}

module.exports = {
  entry: {'index': entryPoint('index')},

  devtool: process.env.WEBPACK_DEVTOOL || 'source-map',
  output: {
    publicPath: './',
    path: path.join(process.cwd(), 'dist'),
    filename: '[name].js'
  },
  resolve: {
    alias: {
      'react': path.resolve(path.join(process.cwd(), 'node_modules', 'react'))
    },
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel']
      },
      {
        test: /\.pug$/,
        exclude: /node_modules/,
        loader: 'pug-html-loader'
      },
      {
        test: /^((?!\.global).)*\.css$/,
        exclude: /node_modules/,
        loaders: [
          'style-loader',
          'css-loader?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
        ]
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?prefix=font/&limit=5000'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
      }
    ]
  },
  devServer: {
    contentBase: path.join(process.cwd(), 'dist'),
    noInfo: true, //  --no-info option
    hot: true,
    inline: true,
    port: PORT,
    host: HOST,
    headers: {Pragma: 'no-cache', Expires: 0, 'Cache-Control': 'no-cache, no-store, must-revalidate'},
    historyApiFallback: true
    },
  plugins
};
