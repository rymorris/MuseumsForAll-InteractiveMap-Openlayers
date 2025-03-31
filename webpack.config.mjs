import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import WebpackShellPluginNext from 'webpack-shell-plugin-next';
import { buildPlugins } from './buildStates.mjs';



// Create __dirname equivalent
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Webpack configuration
const config = {
  mode: 'development',
  entry: './src/index.js',
  devtool: 'cheap-module-source-map', // Better for development
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, ''),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, ''),
    },
    compress: false,
    port: 9000,
    hot: false, // Temporarily disable to check if HMR is the issue
    open: false,
  },
  plugins: [
    new WebpackShellPluginNext({
      onBuildStart: {
        scripts: ['node ./mergeStates.js'],
        blocking: true, // Waits for script to finish
        parallel: false
      },
      onBuildEnd: {
        scripts: ['echo "states merged"'],
        blocking: false, // Runs in background
        parallel: true
      }
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body', // Explicitly inject at end of body
      hash: true, // Optional: adds hash to prevent caching issues
      templateParameters: {
        state: '',
        url: '',
        urlPrefix: '',
        stateCenter: 'const stateCenter = undefined;',
      }
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src', 'index.css'),
          to: path.resolve(__dirname, '', 'index.css')
        },
        {
          from: path.resolve(__dirname, 'src', 'USCities.json'),
          to: path.resolve(__dirname, '', 'USCities.json')
        },
        {
          from: path.resolve(__dirname, 'src', 'about.html'),
          to: path.resolve(__dirname, '', 'about.html')
        }
      ]
    }),
    ...buildPlugins(),
  ],
  resolve: {
    fallback: {
      "buffer": false,
      "stream": false,
      "assert": false,
      "util": false,
      "http": false,
      "https": false,
      "url": false,
      "zlib": false,
      "os": false,
      "path": false,
      "fs": false
    }
  }
};

export default config;