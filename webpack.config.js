const path = require('path');

module.exports = {
  entry: './src/game.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '/'),
    },
    devMiddleware: {
      publicPath: '/dist/'
    },
    compress: true,
    port: 3000,
  },
  mode: 'development'
}; 