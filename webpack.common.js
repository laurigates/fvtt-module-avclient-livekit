const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const { processTemplate } = require("./scripts/process-template");

module.exports = {
  target: "browserslist",
  entry: {
    "avclient-livekit": "./src/avclient-livekit.ts",
    "livekit-web-client": "./src/livekit-web-client.ts",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    // Process module.json template and add to webpack assets
    {
      apply: (compiler) => {
        compiler.hooks.compilation.tap('ProcessTemplate', (compilation) => {
          compilation.hooks.processAssets.tap(
            {
              name: 'ProcessTemplate',
              stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
            },
            () => {
              const { processTemplateToString } = require("./scripts/process-template");
              const moduleJsonContent = processTemplateToString();
              
              compilation.emitAsset('module.json', {
                source: () => moduleJsonContent,
                size: () => moduleJsonContent.length
              });
            }
          );
        });
      }
    },
    new CopyPlugin({
      patterns: [
        { from: "css/", to: "css/" },
        { from: "lang/", to: "lang/" },
        { from: "templates/", to: "templates/" },
        { from: "web-client/", to: "web-client/" },
        { from: "*.md" },
        { from: "LICENSE*" },
      ],
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    }),
  ],
  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    fallback: {
      buffer: require.resolve("buffer/"),
      crypto: require.resolve("crypto-browserify/"),
      stream: require.resolve("stream-browserify"),
      util: require.resolve("util/"),
    },
    symlinks: false,
  },
  module: {
    rules: [
      // All files with a ".ts" or ".tsx" extension will be handled by "ts-loader".
      { 
        test: /\.tsx?$/, 
        loader: "ts-loader", 
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
          compilerOptions: {
            noEmitOnError: false
          }
        }
      },
      // All output ".js" files will have any sourcemaps re-processed by "source-map-loader".
      { test: /\.js$/, loader: "source-map-loader", exclude: /node_modules/ },
      // Fix build bug with webpack 5: https://github.com/remirror/remirror/issues/1473
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
};
