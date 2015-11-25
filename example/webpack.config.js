module.exports = {
  context: __dirname,

  entry:  {
    example: 'example.js'
  },

  devtool: 'eval-source-map',

  output: {
    path: __dirname,
    publicPath: '/',
    filename: '[name].js'
  },

  resolve: {
    root: [ __dirname ]
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: "css",
        exclude: /node_modules/
      }
    ]
  }
};
