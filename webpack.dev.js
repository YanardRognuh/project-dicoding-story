const path = require("path");
const common = require("./webpack.common.js");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
  mode: "development",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, "src"),
      watch: true, // awasi src, bukan dist
    },
    devMiddleware: {
      publicPath: "/",
    },
    port: 9000,
    open: false,
    client: {
      overlay: {
        errors: true,
        warnings: true,
      },
    },
  },
});
