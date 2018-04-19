const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;

module.exports = {
  entry: {
    home: './src/js/home.js',
    restaurant: './src/js/restaurant.js',
    'home-styles': './src/style/home.css',
    'restaurant-styles': './src/style/restaurant.css',
  },

  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: '[name].js'
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
    new ImageminPlugin({
      test: /\.(jpe?g|png|gif|svg)$/i,
      disable: process.env.NODE_ENV !== 'production'
    }),
    new ExtractTextPlugin({
      allChunks: true,
      filename: '[name].css',
    })
  ]
};