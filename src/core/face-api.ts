/**
 * @file Main FaceAPI class that orchestrates face detection and landmark detection
 * 
 * This file implements the main API class that coordinates between the face detector
 * and landmark detector to provide a complete facial analysis solution.
 */
import { 
  DetectionOptions, 
  MediaElement,
  PossiblyTrackedFace,
  PossiblyTrackedFaceDetectionWithLandmarks,
  DetectionResult,
  Point3D
} from '../types/types';
import { FaceDetector } from './face-detector';
import { LandmarkDetector } from './landmark-detector';
import { FaceDetectionError, ErrorCode } from '../types/errors';
import { ValidationService } from '../services/validation-service';
import { Logger } from '../services/logger-service';
import { ConfigurationService } from '../services/configuration-service';

/**
 * Main API class for face detection functionality.
 * This class orchestrates the face detection pipeline, managing the connection
 * between face detection and landmark detection.
 * 
 * @example
 * // Basic usage
 * const api = new FaceAPI();
 * const result = await api.detectFaces(imageElement);
 * console.log(`Detected ${result.faces.length} faces`);
 */
export class FaceAPI {
  private faceDetector: FaceDetector;
  private landmarkDetector: LandmarkDetector;
  private options: DetectionOptions;
  private isDisposed: boolean = false;

  /**
   * Creates a new FaceAPI instance with the specified options
   * @param options Detection configuration options
   */
  constructor(options?: DetectionOptions) {
    this.options = options || ConfigurationService.createDefaultOptions('browser');
    this.faceDetector = new FaceDetector(this.options);
    this.landmarkDetector = new LandmarkDetector(this.options);
    Logger.info('FaceAPI initialized');
  }

  /**
   * Detects faces in an image or video
   * @param input Image, video, or canvas element
   * @param options Detection options
   * @returns Detection result containing faces and timing information
   */
  public async detectFaces(
    input: MediaElement,
    options?: DetectionOptions
  ): Promise<DetectionResult<PossiblyTrackedFace>> {
    ValidationService.validateDisposed(this.isDisposed);
    ValidationService.validateInput(input);
    
    if (options) {
      this.updateOptions(options);
    }
    
    const startTime = performance.now();
    try {
      // Get detection result with timing already included
      const detectionResult = await this.faceDetector.detectFaces(input);
      
      const duration = performance.now() - startTime;
      Logger.performance('detectFaces', duration);
      
      return detectionResult;
    } catch (error) {
      Logger.error('Face detection failed', error as Error);
      throw new FaceDetectionError(
        `Face detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          code: ErrorCode.DETECTION_FAILED,
          originalError: error instanceof Error ? error : undefined
        }
      );
    }
  }

  /**
   * Detects faces with landmarks in an image or video
   * @param input Image, video, or canvas element
   * @param options Detection options
   * @returns Detection result containing faces with landmarks and timing information
   * 
   * @example
   * // Detect faces with landmarks and access points
   * const api = new FaceAPI({ maxFaces: 5 });
   * const result = await api.detectFacesWithLandmarks(videoElement);
   * 
   * for (const face of result.faces) {
   *   // Access bounding box
   *   const { x, y, width, height } = face.detection.box;
   *   
   *   // Access landmarks
   *   const nosePoint = face.landmarks.positions[0];
   *   console.log(`Nose position: ${nosePoint.x}, ${nosePoint.y}`);
   * }
   */
  public async detectFacesWithLandmarks(
    input: MediaElement,
    options?: DetectionOptions
  ): Promise<DetectionResult<PossiblyTrackedFaceDetectionWithLandmarks>> {
    ValidationService.validateDisposed(this.isDisposed);
    ValidationService.validateInput(input);
    
    if (options) {
      this.updateOptions(options);
    }
    
    const startTime = performance.now();
    try {
      // First, detect the faces
      const faceResult = await this.faceDetector.detectFaces(input);
      
      // If no faces were detected, return empty result with timing
      if (!faceResult.faces || faceResult.faces.length === 0) {
        Logger.debug('No faces detected, skipping landmark detection');
        
        return {
          faces: [],
          timing: {
            ...faceResult.timing,
            total: performance.now() - startTime
          }
        };
      }
      
      // Start landmark detection timing
      const landmarkStartTime = performance.now();
      
      // Handle single face optimization when maxFaces=1
      if (faceResult.faces.length > 1 && 
          this.landmarkDetector['config']?.maxFaces === 1) {
        // Sort faces by confidence and take the highest
        const sortedFaces = [...faceResult.faces].sort(
          (a, b) => b.detection.score - a.detection.score
        );
        const highestConfidenceFace = sortedFaces[0];
        
        const landmarks = await this.landmarkDetector.detectLandmarks(input);
        
        const faceWithLandmarks = {
          ...highestConfidenceFace,
          landmarks: landmarks[0] || { meshPoints: [] }
        };
        
        const landmarkTime = performance.now() - landmarkStartTime;
        const totalTime = performance.now() - startTime;
        
        Logger.performance('detectFacesWithLandmarks', totalTime);
        
        return {
          faces: [faceWithLandmarks],
          timing: {
            total: totalTime,
            preprocessing: faceResult.timing?.preprocessing || 0,
            inference: (faceResult.timing?.inference || 0) + landmarkTime,
            postprocessing: faceResult.timing?.postprocessing || 0
          }
        };
      } else {
        // Standard case for multiple faces
        const landmarks = await this.landmarkDetector.detectLandmarks(input);
        const facesWithLandmarks = this.mapFacesToLandmarks(faceResult.faces, landmarks);
        
        const landmarkTime = performance.now() - landmarkStartTime;
        const totalTime = performance.now() - startTime;
        
        Logger.performance('detectFacesWithLandmarks', totalTime);
        
        return {
          faces: facesWithLandmarks,
          timing: {
            total: totalTime,
            preprocessing: faceResult.timing?.preprocessing || 0,
            inference: (faceResult.timing?.inference || 0) + landmarkTime,
            postprocessing: faceResult.timing?.postprocessing || 0
          }
        };
      }
    } catch (error) {
      Logger.error('Face detection with landmarks failed', error as Error);
      throw new FaceDetectionError(
        `Face detection with landmarks failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          code: ErrorCode.DETECTION_FAILED,
          originalError: error instanceof Error ? error : undefined
        }
      );
    }
  }

  /**
   * Maps face detections to landmarks by combining them
   * @param faces Detected face objects
   * @param landmarks Detected landmark sets
   * @returns Combined faces with landmarks
   * @private
   */
  private mapFacesToLandmarks(
    faces: PossiblyTrackedFace[],
    landmarks: Array<{ meshPoints: Point3D[] }>
  ): PossiblyTrackedFaceDetectionWithLandmarks[] {
    return faces.map((face, index) => {
      return {
        ...face,
        landmarks: landmarks[index] || { meshPoints: [] }
      };
    });
  }

  /**
   * Updates detection options for both face and landmark detectors
   * @param options New detection options to apply
   */
  public updateOptions(options: DetectionOptions): void {
    if (this.isDisposed) {
      throw new FaceDetectionError('API has been disposed and cannot be used', {
        code: ErrorCode.RESOURCE_DISPOSED
      });
    }
    
    this.options = {...this.options, ...options};
    this.faceDetector.updateOptions(options);
    this.landmarkDetector.updateOptions(options);
  }

  /**
   * Preloads and warms up the detection models
   * Call this method to improve the performance of the first detection
   */
  public async warmup(): Promise<void> {
    ValidationService.validateDisposed(this.isDisposed);
    
    try {
      // Warm up both detectors in parallel
      await Promise.all([
        this.faceDetector.warmup(),
        this.landmarkDetector.warmup()
      ]);
      
      Logger.debug('Models warmed up successfully');
    } catch (error) {
      Logger.warn('Error during model warmup (continuing anyway)', error as Error);
    }
  }

  /**
   * Releases all resources used by the API
   * Call this method when face detection is no longer needed
   */
  public dispose(): void {
    if (!this.isDisposed) {
      this.faceDetector.dispose();
      this.landmarkDetector.dispose();
      this.isDisposed = true;
      
      Logger.debug('FaceAPI resources disposed');
    }
  }
} 