const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const babelConfig = require("./babel.config");

const production = process.env.NODE_ENV === "production";
const development = process.env.NODE_ENV === "development";
const mode = development ? "development" : "production";

console.log(mode.toUpperCase());

module.exports = {
  entry: "./src/App/index.ts",
  mode,
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    pathinfo: development ? false : true
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({ template: "index.html" }),
    new webpack.HashedModuleIdsPlugin(),
    new ForkTsCheckerWebpackPlugin({
      tslint: true,
      tsconfig: path.resolve(__dirname, "tsconfig.json"),
      tslint: path.resolve(__dirname, "tslint.json")
    })
  ],
  optimization: {
    runtimeChunk: "single",
    minimize: production,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            loops: false
          },
          mangle: true,
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true
          },
          safari10: true
        },
        parallel: 2,
        cache: true,
        sourceMap: true
      })
    ],
    splitChunks: {
      chunks: "all",
      minSize: 0
    }
  },
  devtool: development ? "inline-source-map" : "source-map",
  resolve: {
    extensions: [".js", ".json", ".ts"]
  },
  devServer: {
    contentBase: "./dist",
    compress: true,
    port: 3000,
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /favicon\.ico$/,
        loader: "url",
        query: {
          limit: 1,
          name: "[name].[ext]"
        }
      },
      {
        test: /\.(ts)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: babelConfig.presets,
              plugins: babelConfig.plugins,
              cacheDirectory: true
            }
          },
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /\.(scss|css)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "sass-loader"]
      },
      {
        test: /\.(png|jpg|gif|svg|ico)$/,
        use: [
          {
            loader: "file-loader"
          }
        ]
      }
    ]
  }
};
