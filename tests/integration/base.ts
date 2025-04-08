import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, loadImage, Image } from 'canvas';
import { PossiblyTrackedFace, PossiblyTrackedFaceDetectionWithLandmarks } from '../../src/types';

// Test directory paths
export const IMAGES_DIR = path.join(__dirname, '../images');
export const OUTPUT_DIR = path.join(__dirname, '../output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Define test image structure
export interface TestImage {
  path: string;
  expectedFaces: number;
  description: string;
}

// List of test images
export const TEST_IMAGES: TestImage[] = [
  { 
    path: path.join(IMAGES_DIR, 'face1.jpg'), 
    expectedFaces: 1, 
    description: 'Single centered face' 
  },
  { 
    path: path.join(IMAGES_DIR, 'face2.jpg'), 
    expectedFaces: 1, 
    description: 'Single face with expression'
  },
  { 
    path: path.join(IMAGES_DIR, 'face3.jpg'), 
    expectedFaces: 1, 
    description: 'Side profile face'
  },
  { 
    path: path.join(IMAGES_DIR, 'face4.jpg'), 
    expectedFaces: 1, 
    description: 'Face with glasses'
  },
  { 
    path: path.join(IMAGES_DIR, 'faces.jpg'), 
    expectedFaces: 3, 
    description: 'Multiple faces (3 people)'
  }
];

/**
 * Load and prepare an image for testing
 * @param imagePath Path to the image
 * @returns Image and canvas
 */
export async function loadAndPrepareImage(imagePath: string): Promise<{ image: Image, canvas: any }> {
  // Check if file exists
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }
  
  try {
    // Load image
    const image = await loadImage(imagePath);
    
    // Create canvas
    const canvas = createCanvas(image.width, image.height) as any;
    const ctx = canvas.getContext('2d');
    
    // Draw image on canvas
    ctx.drawImage(image, 0, 0, image.width, image.height);
    
    // Add clone method to canvas to make it compatible with browser Canvas API
    if (!canvas.clone) {
      canvas.clone = function() {
        const newCanvas = createCanvas(this.width, this.height);
        const newCtx = newCanvas.getContext('2d');
        newCtx.drawImage(this, 0, 0);
        return newCanvas;
      };
    }
    
    return { image, canvas };
  } catch (error) {
    console.error(`Error loading image ${imagePath}:`, error);
    throw error;
  }
}

/**
 * Validate detection results
 * @param detections Detections to validate
 * @param expectedCount Expected number of faces
 */
export function validateDetections(
  detections: PossiblyTrackedFace[] | PossiblyTrackedFaceDetectionWithLandmarks[], 
  expectedCount: number
): void {
  // Check number of detected faces
  expect(detections).toHaveLength(expectedCount);
  
  // Check detection format
  if (detections.length > 0) {
    // Check box
    expect(detections[0]).toHaveProperty('detection.box');
    expect(detections[0].detection.box).toHaveProperty('x');
    expect(detections[0].detection.box).toHaveProperty('y');
    expect(detections[0].detection.box).toHaveProperty('width');
    expect(detections[0].detection.box).toHaveProperty('height');
    
    // Check score
    expect(detections[0].detection).toHaveProperty('score');
    expect(typeof detections[0].detection.score).toBe('number');
    
    // Check landmarks if available (now checking for meshPoints)
    if ('landmarks' in detections[0]) {
      expect(detections[0]).toHaveProperty('landmarks.meshPoints'); // Ensure this checks for meshPoints
      expect(Array.isArray((detections[0] as any).landmarks.meshPoints)).toBe(true); 
      expect((detections[0] as any).landmarks.meshPoints.length).toBeGreaterThan(0); 
    }
  }
}

/**
 * Save visual detection result
 * @param canvas Canvas containing the image
 * @param detections Detections to draw
 * @param outputPath Path to save the result image
 */
export async function saveDetectionResult(
  canvas: any, 
  detections: PossiblyTrackedFace[] | PossiblyTrackedFaceDetectionWithLandmarks[],
  outputPath: string
): Promise<void> {
  const ctx = canvas.getContext('2d');
  
  // Draw rectangles around faces
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 3;
  
  detections.forEach((detection) => {
    const { x, y, width, height } = detection.detection.box;
    ctx.strokeRect(x, y, width, height);
    
    // Draw score
    ctx.fillStyle = 'red';
    ctx.font = '16px Arial';
    ctx.fillText(
      `${Math.round(detection.detection.score * 100)}%`, 
      x, 
      y - 5
    );
    
    // Draw landmarks if available (now using meshPoints)
    if ('landmarks' in detection) {
      const meshPoints = (detection as any).landmarks.meshPoints; // Use meshPoints
      ctx.fillStyle = 'blue';
      
      meshPoints.forEach((point: {x: number, y: number}) => { // Iterate over meshPoints
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI); // Draw each point (ignoring z for 2D canvas)
        ctx.fill();
      });
    }
  });
  
  // Save result
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(outputPath, buffer);
  } catch (error) {
    console.error(`Error saving detection result to ${outputPath}:`, error);
    throw error;
  }
} 