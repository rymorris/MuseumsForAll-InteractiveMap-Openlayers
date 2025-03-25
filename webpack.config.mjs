import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

// Create __dirname equivalent
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Webpack configuration
const config = {
  mode: 'development',
  entry: './index.js',
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
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
    }),
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