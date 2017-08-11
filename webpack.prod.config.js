var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.join(__dirname, './src/cms/public/js/')
var APP_DIR = path.join(__dirname, './src/site/')

var config = {
  entry: APP_DIR + 'index.jsx',
  devtool: 'source-map',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js',
    publicPath: '/public/js/'
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      sourceMap: true,
      minimize: true,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true
      },
      comments: false
    })
  ],
  module : {
    loaders : [
      {
        test: /\.jsx?/,
        include: APP_DIR,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['stage-0', 'es2015', 'react'],
          plugins: ['transform-decorators-legacy', 'transform-class-properties'],
        },
      }, {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loaders: [
          'babel-loader?presets[]=react,presets[]=es2015,presets[]=stage-0',
        ],
      }, {
        test: /\.js(x)?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          fix: false,
        },
      }, {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
    ]
  },
  resolve: { extensions: ['.js', '.jsx'] }
};

module.exports = config;
