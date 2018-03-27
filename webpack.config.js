const path = require('path');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: ['./src/js/main.js', './src/style/styles.css'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [{
            loader: 'css-loader',
            // Dont touch urls inside scss files.
            options: {
              url: false,
              sourceMaps: true
            }
          }]
        })
      }
    ]
  },

  plugins: [
    new CopyWebpackPlugin([{
      from: './src/assets',
      ignore: ['.DS_Store']
    }]),
    new ExtractTextPlugin('styles.css'),
  ]
};