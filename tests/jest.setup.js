import 'isomorphic-fetch';

// Set the backend to CPU for JSDOM environment
beforeAll(async () => {
  await tf.setBackend('cpu');
  await tf.ready(); // Ensure backend is ready
}); 