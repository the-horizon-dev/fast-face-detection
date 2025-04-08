/**
 * @file Core module index file
 * 
 * This file exports the main algorithmic components of the face detection library.
 * These core classes handle the main functionality including:
 * - The main FaceAPI interface
 * - Face detection algorithms
 * - Facial landmark detection
 */

// Export primary API class
export * from './face-api';

// Export face detection components
export * from './face-detector';

// Export facial landmark detection components
export * from './landmark-detector'; 