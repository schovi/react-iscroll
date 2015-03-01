var path = require("path")
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  entry:  './example/example.jsx',
  output: {
    filename: 'example.js',
    path: '/',
    publicPath: '/'
  },
  plugins: [
    new ExtractTextPlugin("example.css", { allChunks: true })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'react-hot-loader',
        exclude: /node_modules/
      },
      {
        test: /\.jsx$/,
        loader: 'react-hot-loader!jsx-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader")
      }
    ]
  }
};
