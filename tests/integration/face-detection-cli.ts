/**
 * Command-line script to test face detection functionality
 * This script loads test images and saves detection results to the output folder
 */
import * as path from 'path';
import * as fs from 'fs';
import { mediapipeFace } from '../../src';
import { TEST_IMAGES, OUTPUT_DIR, loadAndPrepareImage, saveDetectionResult } from './base';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export async function runFaceDetection(): Promise<void> {
  console.log('Initializing face detection...');
  
  try {
    // Initialize the model with explicit environment setting for Node.js
    const environment = await mediapipeFace.initialize({ 
      environment: 'node'
    });
    
    console.log(`Detected environment: ${environment}`);
    console.log(`Testing ${TEST_IMAGES.length} images...`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const testImage of TEST_IMAGES) {
      try {
        console.log(`\nProcessing: ${testImage.description} (${path.basename(testImage.path)})`);
        console.log(`Expected faces: ${testImage.expectedFaces}`);
        
        // Load and prepare the image
        const { canvas } = await loadAndPrepareImage(testImage.path);
        
        // 1. Basic face detection
        console.log('Running face detection...');
        const faceResult = await mediapipeFace.detectFaces(canvas, {
          scoreThreshold: 0.5,
          maxFaces: 10
        }, true);
        
        console.log(`Detected ${faceResult.faces.length} faces`);
        console.log(`Detection time: ${faceResult.timing?.total.toFixed(2)}ms`);
        
        // Save detection result
        const detectionOutputPath = path.join(OUTPUT_DIR, `detection_${path.basename(testImage.path)}`);
        await saveDetectionResult(canvas, faceResult.faces, detectionOutputPath);
        console.log(`Saved detection result to: ${detectionOutputPath}`);
        
        // 2. Face detection with landmarks
        console.log('Running face detection with landmarks...');
        const { canvas: canvas2 } = await loadAndPrepareImage(testImage.path);
        
        const landmarkResult = await mediapipeFace.detectFacesWithLandmarks(canvas2, {
          scoreThreshold: 0.5,
          maxFaces: 10
        }, true);
        
        console.log(`Detected ${landmarkResult.faces.length} faces with landmarks`);
        console.log(`Detection time with landmarks: ${landmarkResult.timing?.total.toFixed(2)}ms`);
        
        // Save landmark result
        const landmarkOutputPath = path.join(OUTPUT_DIR, `landmarks_${path.basename(testImage.path)}`);
        await saveDetectionResult(canvas2, landmarkResult.faces, landmarkOutputPath);
        console.log(`Saved landmark result to: ${landmarkOutputPath}`);
        
        // 3. Detection with different thresholds (only for images with multiple faces)
        if (testImage.expectedFaces > 1) {
          console.log('Testing different detection thresholds...');
          
          // High threshold detection
          const { canvas: canvasHigh } = await loadAndPrepareImage(testImage.path);
          const highThresholdResult = await mediapipeFace.detectFaces(canvasHigh, {
            scoreThreshold: 0.8,
            maxFaces: 10
          }, true);
          
          const highThresholdPath = path.join(OUTPUT_DIR, `high_threshold_${path.basename(testImage.path)}`);
          await saveDetectionResult(canvasHigh, highThresholdResult.faces, highThresholdPath);
          console.log(`High threshold (0.8) detected: ${highThresholdResult.faces.length} faces`);
          
          // Low threshold detection
          const { canvas: canvasLow } = await loadAndPrepareImage(testImage.path);
          const lowThresholdResult = await mediapipeFace.detectFaces(canvasLow, {
            scoreThreshold: 0.3,
            maxFaces: 10
          }, true);
          
          const lowThresholdPath = path.join(OUTPUT_DIR, `low_threshold_${path.basename(testImage.path)}`);
          await saveDetectionResult(canvasLow, lowThresholdResult.faces, lowThresholdPath);
          console.log(`Low threshold (0.3) detected: ${lowThresholdResult.faces.length} faces`);
        }
        
        successCount++;
      } catch (error) {
        console.error(`Error processing image ${testImage.path}:`, error);
        failCount++;
      }
    }
    
    console.log('\n===== Test Summary =====');
    console.log(`Total tests: ${TEST_IMAGES.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    
    if (failCount === 0) {
      console.log('\n✅ All tests completed successfully!');
    } else {
      console.log(`\n⚠️ ${failCount} test(s) failed.`);
      throw new Error(`${failCount} tests failed`);
    }
  } catch (error) {
    console.error('Error running tests:', error);
    throw error;
  } finally {
    // Clean up resources
    mediapipeFace.dispose();
    console.log('Resources disposed.');
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  runFaceDetection().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} 