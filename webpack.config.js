const webpack = require("webpack");
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "stopwatch.js",
    library: "stopwatch",
    libraryTarget: "umd"
  }
};
