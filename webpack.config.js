const path = require('path');
// const webpack = require('webpack');

module.exports = {
  entry: "./src/js/gym-tracker-client.js",
  // entry: [ "webpack-hot-middleware/client", "./src/js/gym-tracker.js" ],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, 'public/js')
  },
  // plugins: [
  //   new webpack.HotModuleReplacementPlugin()
  // ]
};