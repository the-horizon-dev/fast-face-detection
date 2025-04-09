/**
 * Main entry point for the fast-face-detection library
 */

// Main imports
import { FaceAPI } from './core';
import { 
  DetectionOptions, 
  MediaElement, 
  PossiblyTrackedFace, 
  PossiblyTrackedFaceDetectionWithLandmarks, 
  Environment,
  DetectionResult
} from './types';
import { detectEnvironment, initTensorflowBackend } from './utils';
import { Logger } from './services';

// API cache
let cachedAPI: FaceAPI | null = null;
let currentEnvironment: Environment = 'browser';

/**
 * Initializes the backend
 */
const initBackend = async (): Promise<void> => {
  try {
    currentEnvironment = detectEnvironment();
    Logger.debug(`Detected environment: ${currentEnvironment}`);
    await initTensorflowBackend(currentEnvironment);
  } catch (error) {
    Logger.warn('Error initializing internal resources', error instanceof Error ? error : new Error(String(error)));
  }
};

/**
 * Ensures the Face API is initialized
 */
const ensureAPI = async (options?: DetectionOptions): Promise<FaceAPI> => {
  await initBackend();
  
  if (!cachedAPI) {
    cachedAPI = new FaceAPI({...options, environment: currentEnvironment});
  } else if (options) {
    cachedAPI.updateOptions({...options, environment: currentEnvironment});
  }
  
  return cachedAPI;
};

/**
 * Main API for facial detection
 */
export const mediapipeFace = {
  /**
   * Detects faces in an image or video element
   */
  detectFaces: async <T extends boolean = false>(
    input: MediaElement,
    options?: DetectionOptions,
    withTiming?: T
  ): Promise<T extends true ? DetectionResult<PossiblyTrackedFace> : PossiblyTrackedFace[]> => {
    const api = await ensureAPI(options);
    const result = await api.detectFaces(input);
    
    if (withTiming) {
      return result as T extends true ? DetectionResult<PossiblyTrackedFace> : PossiblyTrackedFace[];
    } else {
      return result.faces as T extends true ? DetectionResult<PossiblyTrackedFace> : PossiblyTrackedFace[];
    }
  },
  
  /**
   * Detects faces with facial landmarks
   */
  detectFacesWithLandmarks: async <T extends boolean = false>(
    input: MediaElement,
    options?: DetectionOptions,
    withTiming?: T
  ): Promise<T extends true ? DetectionResult<PossiblyTrackedFaceDetectionWithLandmarks> : PossiblyTrackedFaceDetectionWithLandmarks[]> => {
    const api = await ensureAPI(options);
    const result = await api.detectFacesWithLandmarks(input);
    
    if (withTiming) {
      return result as T extends true ? DetectionResult<PossiblyTrackedFaceDetectionWithLandmarks> : PossiblyTrackedFaceDetectionWithLandmarks[];
    } else {
      return result.faces as T extends true ? DetectionResult<PossiblyTrackedFaceDetectionWithLandmarks> : PossiblyTrackedFaceDetectionWithLandmarks[];
    }
  },
  
  /**
   * Releases resources used by the library
   */
  dispose: () => {
    if (cachedAPI) {
      cachedAPI.dispose();
      cachedAPI = null;
    }
  },
  
  /**
   * Explicitly initializes face detection models
   */
  initialize: async (options?: DetectionOptions): Promise<Environment> => {
    const api = await ensureAPI(options);
    await api.warmup();
    return currentEnvironment;
  }
};

/**
 * Utilities for facial detection
 */
export const utils = {
  /**
   * Sets the library's logging level
   */
  setLogLevel: (level: 'debug' | 'info' | 'warn' | 'error' | 'none'): void => {
    // @ts-ignore - If Logger has this method
    if (typeof Logger.setLevel === 'function') {
      // @ts-ignore
      Logger.setLevel(level);
    } else {
      console.warn('setLevel method not available in Logger');
    }
  },
  
  /**
   * Current version of the library
   */
  VERSION: '1.0.0'
};

// Export types
export * from './types';

// Export core components
export { FaceAPI } from './core';
export * from './core';

// Export utilities
export * from './utils';

// Export services
export * from './services'; 