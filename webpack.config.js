const path = require('path');

module.exports = {
  entry: "./src/gym-tracker.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, 'public/js')
  }
};