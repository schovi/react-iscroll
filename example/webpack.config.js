var webpack = require('webpack')

module.exports = {
  context: __dirname,
  entry:  {
    example: [
      './example.js'
    ]
  },
  devtool: 'eval-source-map',
  output: {
    path: __dirname,
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          presets: ["es2015", "react"],
          plugins: ["transform-class-properties"]
        }
      },
      {
        test: /\.css$/,
        loader: "css",
        exclude: /node_modules/
      }
    ]
  }
};
