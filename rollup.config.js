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
      sourcemap: true,
      dynamicImportInCjs: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  external: [
    '@tensorflow/tfjs-core', 
    '@tensorflow/tfjs-backend-webgl',
    '@tensorflow/tfjs-backend-cpu',
    '@tensorflow/tfjs-converter',
    '@tensorflow/tfjs-react-native',
    '@tensorflow-models/face-detection',
    '@tensorflow-models/face-landmarks-detection'
  ],
  plugins: [
    typescript({
      typescript: tsc,
      clean: true,
      tsconfigOverride: {
        exclude: ["tests/**/*", "node_modules/**/*"],
        compilerOptions: {
          module: "ESNext"
        }
      }
    })
  ]
}; 