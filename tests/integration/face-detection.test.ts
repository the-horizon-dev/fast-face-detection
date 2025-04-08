import * as path from 'path';
import { mediapipeFace } from '../../src';
import { 
  loadAndPrepareImage, 
  saveDetectionResult, 
  validateDetections,
  TEST_IMAGES,
  OUTPUT_DIR
} from './base';

// Add fetch polyfill for Node.js environment
import fetch from 'isomorphic-fetch';
// Add to global scope for TensorFlow model loading
global.fetch = fetch;

// Suppress TensorFlow.js backend warnings during tests
const originalConsoleWarn = console.warn;
console.warn = function(msg, ...args) {
  // Filter out the TensorFlow.js backend warning
  if (typeof msg === 'string' && msg.includes('Hi, looks like you are running TensorFlow.js in Node.js')) {
    return;
  }
  originalConsoleWarn(msg, ...args);
};

describe('Face Detection Integration Tests', () => {
  // Increase timeout for model loading and detection
  jest.setTimeout(60000); // Increased timeout to 60 seconds
  
  beforeAll(async () => {
    // Initialize the API before tests with proper environment detection
    try {
      await mediapipeFace.initialize({ 
        environment: 'node', // Force node environment for Jest tests
        scoreThreshold: 0.5
      });
      console.log('MediaPipe Face detection initialized successfully');
    } catch (error) {
      console.error('Error initializing MediaPipe Face detection:', error);
      throw error;
    }
  });
  
  afterAll(() => {
    // Clean up resources
    try {
      mediapipeFace.dispose();
      console.log('MediaPipe resources disposed');
    } catch (error) {
      console.error('Error disposing resources:', error);
    }
    
    // Restore original console.warn
    console.warn = originalConsoleWarn;
  });
  
  test('should detect faces in single images', async () => {
    for (const testImage of TEST_IMAGES) {
      console.log(`Testing image: ${testImage.description}`);
      
      try {
        // Load and prepare the image
        const { canvas } = await loadAndPrepareImage(testImage.path);
        
        // Detect faces
        const detectionResult = await mediapipeFace.detectFaces(canvas, {
          scoreThreshold: 0.5,
          maxFaces: 10
        }, true);
        
        // Validate the detection
        validateDetections(detectionResult.faces, testImage.expectedFaces);
        
        // Save output for visual verification
        const imageName = path.basename(testImage.path);
        const outputPath = path.join(OUTPUT_DIR, `detection_${imageName}`);
        await saveDetectionResult(canvas, detectionResult.faces, outputPath);
        
        // Check performance data
        expect(detectionResult.timing?.total).toBeGreaterThan(0);
        expect(detectionResult.timing?.inference).toBeGreaterThan(0);
        console.log(`Detection time: ${detectionResult.timing?.total}ms`);
      } catch (error) {
        console.error(`Error testing image ${testImage.path}:`, error);
        throw error;
      }
    }
  });
  
  test('should detect faces with landmarks', async () => {
    for (const testImage of TEST_IMAGES) {
      console.log(`Testing landmarks in image: ${testImage.description}`);
      
      try {
        // Load and prepare the image
        const { canvas } = await loadAndPrepareImage(testImage.path);
        
        // Detect faces with landmarks
        const detectionResult = await mediapipeFace.detectFacesWithLandmarks(canvas, {
          scoreThreshold: 0.5,
          maxFaces: 10
        }, true);
        
        // Validate the detection
        validateDetections(detectionResult.faces, testImage.expectedFaces);
        
        // Each face should have landmarks (now checking for meshPoints)
        detectionResult.faces.forEach(face => {
          expect(face).toHaveProperty('landmarks');
          expect(face.landmarks).toHaveProperty('meshPoints'); // Check for meshPoints
          expect(Array.isArray(face.landmarks.meshPoints)).toBe(true);
          expect(face.landmarks.meshPoints.length).toBeGreaterThan(0); // Check meshPoints length
        });
        
        // Save output for visual verification
        const imageName = path.basename(testImage.path);
        const outputPath = path.join(OUTPUT_DIR, `landmarks_${imageName}`);
        await saveDetectionResult(canvas, detectionResult.faces, outputPath);
        
        // Check performance data
        expect(detectionResult.timing?.total).toBeGreaterThan(0);
        console.log(`Landmark detection time: ${detectionResult.timing?.total}ms`);
      } catch (error) {
        console.error(`Error testing landmarks for image ${testImage.path}:`, error);
        throw error;
      }
    }
  });
  
  test('should handle different detection thresholds', async () => {
    const testImage = TEST_IMAGES.find(img => img.expectedFaces > 1);
    if (!testImage) {
      throw new Error('Test requires an image with multiple faces');
    }
    
    try {
      const { canvas } = await loadAndPrepareImage(testImage.path);
      
      // Test with high threshold - should find fewer faces
      const highThresholdResult = await mediapipeFace.detectFaces(canvas, {
        scoreThreshold: 0.8,
        maxFaces: 10
      });
      
      // Test with low threshold - should find more faces
      const lowThresholdResult = await mediapipeFace.detectFaces(canvas, {
        scoreThreshold: 0.3,
        maxFaces: 10
      });
      
      // The high threshold should find fewer or equal faces
      expect(highThresholdResult.length).toBeLessThanOrEqual(lowThresholdResult.length);
      
      // Save both results
      const imageName = path.basename(testImage.path);
      
      const canvasHigh = canvas.clone();
      await saveDetectionResult(
        canvasHigh, 
        highThresholdResult, 
        path.join(OUTPUT_DIR, `high_threshold_${imageName}`)
      );
      
      await saveDetectionResult(
        canvas, 
        lowThresholdResult, 
        path.join(OUTPUT_DIR, `low_threshold_${imageName}`)
      );
    } catch (error) {
      console.error('Error testing detection thresholds:', error);
      throw error;
    }
  });
  
  test('should handle maxFaces parameter correctly', async () => {
    const testImage = TEST_IMAGES.find(img => img.expectedFaces > 1);
    if (!testImage) {
      throw new Error('Test requires an image with multiple faces');
    }
    
    try {
      const { canvas } = await loadAndPrepareImage(testImage.path);
      
      // Test with max faces = 1
      const singleFaceResult = await mediapipeFace.detectFaces(canvas, {
        maxFaces: 1
      });
      
      expect(singleFaceResult.length).toBeLessThanOrEqual(1);
      
      // Test with max faces > expected
      const multipleFaceResult = await mediapipeFace.detectFaces(canvas, {
        maxFaces: testImage.expectedFaces
      });
      
      expect(multipleFaceResult.length).toBeLessThanOrEqual(testImage.expectedFaces);
      expect(multipleFaceResult.length).toBeGreaterThanOrEqual(singleFaceResult.length);
      
      // Save results
      const imageName = path.basename(testImage.path);
      
      const canvasSingle = canvas.clone();
      await saveDetectionResult(
        canvasSingle, 
        singleFaceResult, 
        path.join(OUTPUT_DIR, `max_1_face_${imageName}`)
      );
      
      await saveDetectionResult(
        canvas, 
        multipleFaceResult, 
        path.join(OUTPUT_DIR, `max_${testImage.expectedFaces}_faces_${imageName}`)
      );
    } catch (error) {
      console.error('Error testing maxFaces parameter:', error);
      throw error;
    }
  });
}); 