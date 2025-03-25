import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

// Create __dirname equivalent
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Webpack configuration
const config = {
  entry: './index.js',
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
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
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