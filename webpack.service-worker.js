const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  devtool: false,
  optimization: {
    minimize: true,
  },
  performance: {
    hints: false,
  },
  experiments: {
    outputModule: true,
  },
  output: {
    environment: {
      // The environment supports these features
      arrowFunction: true,
      bigIntLiteral: false,
      const: true,
      destructuring: true,
      dynamicImport: true,
      forOf: true,
      module: true,
      optionalChaining: true,
      templateLiteral: true,
    },
  },
});
