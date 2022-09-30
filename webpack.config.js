const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
module.exports = {
  entry: {
    background: './src/background/index.ts',
    content: './src/content/index.ts',
  },

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].min.js',
  },

  resolve: {
    extensions: ['.ts'],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {from: 'src/content/style.css', to: 'style.css'},
      ]}),
  ],

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },

  optimization: {
    minimize: false,
  },
};
