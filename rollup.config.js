import typescript from 'rollup-plugin-typescript2';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const tsc = require('typescript');

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  external: [
    '@tensorflow/tfjs-core', 
    '@tensorflow-models/face-detection',
    '@tensorflow-models/face-landmarks-detection'
  ],
  plugins: [
    typescript({
      typescript: tsc,
      clean: true
    })
  ]
}; 