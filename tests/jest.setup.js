import 'isomorphic-fetch';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';

// Set the backend to CPU for JSDOM environment
beforeAll(async () => {
  await tf.setBackend('cpu');
  await tf.ready(); // Ensure backend is ready
}); 