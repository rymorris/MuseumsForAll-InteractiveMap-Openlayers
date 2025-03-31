import fs from 'fs-extra';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function buildPlugins() {
  const stateCenterData = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'stateCenters.json'))
  );
  const jsonFiles = fs.readdirSync(path.resolve(__dirname, 'statesJSON'))
    .filter(file => file.endsWith('.json'));

  return jsonFiles.map(file => {
    const state = path.basename(file, '.json');
    const data = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, 'statesJSON', file))
    );
    console.log(state)
    const result = stateCenterData.states.filter((data) => data.state.includes(state));
    console.log(result)
    return new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: `./states/${state}.html`,
      publicPath: '../', 
      inject: 'body', // Explicitly inject at end of body
      hash: true, // Optional: adds hash to prevent caching issues
      templateParameters: {
        ...data,
        state: `${state} `,
        url: `states/${state}.html`,
        urlPrefix: '../',
        stateCenter: `const stateCenter = [${result[0].longitude}, ${result[0].latitude}];`
      }
    });
  });
}