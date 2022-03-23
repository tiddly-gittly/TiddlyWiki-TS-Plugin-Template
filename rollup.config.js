import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import disablePackages from 'rollup-plugin-disable-packages';
import { readJsonSync } from 'fs-extra';

const packageJSON = readJsonSync('package.json');

const shared = {
  external: ['events', 'fs', 'fsevents', 'util', 'path', 'os', 'stream'],
  plugins: [
    nodeResolve({ browser: true }),
    commonjs(),
    typescript(),
    json(),

    // We are not able to bundle in fsevents since it is a native osx lib.
    // It will give us errors if we don't disable (replace it with noop) it.
    // We must also use `useFsEvents: false` when calling chokidar.watch.
    disablePackages('fsevents'),
  ],
};

export default packageJSON.tsFiles.map((tsFileName) => ({
  input: `src/${tsFileName}.ts`,
  output: [
    {
      file: `./dist/plugins/${packageJSON.author}/${packageJSON.name}/${tsFileName}.js`,
      format: 'commonjs',
      sourcemap: 'inline',
      exports: 'named',
    },
  ],
  ...shared,
}));
