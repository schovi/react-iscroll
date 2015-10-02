var path = require("path")

module.exports = {
  entry:  './example/example.js',
  devtool: 'eval-source-map',
  output: {
    filename: 'example.js',
    path: '/',
    publicPath: '/'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'react-hot-loader!babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: "css-loader"
      }
    ]
  }
};
