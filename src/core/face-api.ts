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
  Point3D,
  Box
} from '../types/types';
import { FaceDetector } from './face-detector';
import { LandmarkDetector } from './landmark-detector';
import { FaceDetectionError, ErrorCode } from '../types/errors';
import { ValidationService } from '../services/validation-service';
import { Logger } from '../services/logger-service';
import { ConfigurationService } from '../services/configuration-service';
import { ImageUtils } from '../utils/image-utils';

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
    // Default downscale threshold (e.g., 640px width). 0 means disabled.
    this.options.downscaleWidthThreshold = this.options.downscaleWidthThreshold ?? 640;
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
    
    const _originalInput = input; // Keep original for potential cropping
    let processedInput: MediaElement = input;
    let scaleFactor = 1;
    const isBrowserEnv = typeof document !== 'undefined';
    const isHtmlInput = input instanceof HTMLCanvasElement || input instanceof HTMLImageElement || input instanceof HTMLVideoElement;

    // Downscale if enabled, in browser, and input is compatible
    if (this.options.downscaleWidthThreshold && 
        this.options.downscaleWidthThreshold > 0 && 
        isBrowserEnv && 
        isHtmlInput) {
      try {
        const { downscaledCanvas, scaleFactor: calculatedScale } = ImageUtils.downscaleImage(
          input as HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
          this.options.downscaleWidthThreshold
        );
        processedInput = downscaledCanvas;
        scaleFactor = calculatedScale;
        Logger.debug(`Downscaled input image with factor: ${scaleFactor}`);
      } catch (e) {
        Logger.warn('Failed to downscale input, proceeding with original.', e as Error);
      }
    }

    if (options) {
      this.updateOptions(options);
    }
    
    const startTime = performance.now();
    try {
      // Get detection result with timing already included
      const detectionResult = await this.faceDetector.detectFaces(processedInput);
      
      // Upscale results if downscaling occurred
      if (scaleFactor !== 1) {
        detectionResult.faces = this.upscaleFaces(detectionResult.faces, scaleFactor);
      }
      
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
    
    const originalInput = input; // Keep original for cropping
    let processedInput: MediaElement = input;
    let scaleFactor = 1;
    const isBrowserEnv = typeof document !== 'undefined';
    const isHtmlInput = input instanceof HTMLCanvasElement || input instanceof HTMLImageElement || input instanceof HTMLVideoElement;

    // Downscale if enabled, in browser, and input is compatible
    if (this.options.downscaleWidthThreshold && 
        this.options.downscaleWidthThreshold > 0 && 
        isBrowserEnv && 
        isHtmlInput) {
      try {
        const { downscaledCanvas, scaleFactor: calculatedScale } = ImageUtils.downscaleImage(
          input as HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
          this.options.downscaleWidthThreshold
        );
        processedInput = downscaledCanvas;
        scaleFactor = calculatedScale;
        Logger.debug(`Downscaled input image with factor: ${scaleFactor} for landmark detection`);
      } catch (e) {
        Logger.warn('Failed to downscale input for landmarks, proceeding with original.', e as Error);
      }
    }

    if (options) {
      this.updateOptions(options);
    }
    
    const startTime = performance.now();
    try {
      // First, detect the faces on the (potentially downscaled) input
      const faceResult = await this.faceDetector.detectFaces(processedInput);
      
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
      
      // --- Upscale Face Bounding Boxes --- 
      // Upscale face boxes BEFORE using them for cropping or mapping
      let upscaledFaces: PossiblyTrackedFace[];
      if (scaleFactor !== 1) {
        upscaledFaces = this.upscaleFaces(faceResult.faces, scaleFactor);
      } else {
        upscaledFaces = faceResult.faces;
      }
      // --- End Upscale Face Bounding Boxes --- 

      // Start landmark detection timing
      const landmarkStartTime = performance.now();
      
      // Handle single face optimization when maxFaces=1
      if (faceResult.faces.length > 1 && 
          this.landmarkDetector['config']?.maxFaces === 1) {
        let adjustedLandmarks: Array<{ meshPoints: Point3D[] }>;

        // Sort faces by confidence and take the highest (using upscaled faces)
        const sortedFaces = [...upscaledFaces].sort(
          // (a, b) => b.detection.score - a.detection.score // Original sort by score (now 0)
          // Sort by bounding box area (width * height) instead
          (a, b) => (b.detection.box.width * b.detection.box.height) - (a.detection.box.width * a.detection.box.height)
        );
        const highestConfidenceFace = sortedFaces[0];

        // Check compatibility with the ORIGINAL input for cropping
        const isCompatibleInput = originalInput instanceof HTMLCanvasElement || originalInput instanceof HTMLImageElement || originalInput instanceof HTMLVideoElement;

        if (isBrowserEnv && isCompatibleInput) {
          Logger.debug('Applying single-face landmark cropping optimization.');
          // We know input is one of the HTML*Element types here
          // Use the ORIGINAL input for high-resolution cropping
          const originalCanvas = ImageUtils.elementToCanvas(originalInput as HTMLImageElement | HTMLVideoElement | HTMLCanvasElement);

          // Crop the face region (consider adding a margin option)
          // Use the UPSCALED bounding box for cropping the ORIGINAL image
          const { croppedCanvas, offsetX, offsetY } = ImageUtils.cropFace(
            originalCanvas,
            highestConfidenceFace.detection.box,
            0 // No margin for now
          );
          
          // Detect landmarks only on the cropped face
          const landmarksOnCropped = await this.landmarkDetector.detectLandmarks(croppedCanvas);
          
          // Adjust landmark coordinates back to the original image space
          adjustedLandmarks = landmarksOnCropped.map(landmarkSet => ({
            meshPoints: landmarkSet.meshPoints.map(p => ({
              // Landmarks are detected on the high-res crop,
              // offsetX/Y are relative to the original image.
              x: p.x + offsetX,
              y: p.y + offsetY,
              z: p.z
            }))
          }));
        } else {
          // Fallback: Node.js environment or incompatible input (e.g., NodeCanvasElement)
          if (!isBrowserEnv) {
            Logger.debug('Skipping landmark cropping optimization (non-browser or incompatible input).');
          } else if (!isCompatibleInput) {
            Logger.debug('Skipping landmark cropping optimization (incompatible input type).');
          }

          // Fallback: Detect landmarks on the potentially downscaled input
          const landmarkResultSets = await this.landmarkDetector.detectLandmarks(processedInput);

          // Upscale landmarks if needed
          if (scaleFactor !== 1) {
            adjustedLandmarks = this.upscaleLandmarks(landmarkResultSets, scaleFactor);
          } else {
            adjustedLandmarks = landmarkResultSets;
          }
        }
        
        const faceWithLandmarks = {
          ...highestConfidenceFace,
          landmarks: adjustedLandmarks[0] || { meshPoints: [] }
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
        // For multiple faces, we still need to process the whole image

        // Detect landmarks on the (potentially downscaled) input
        let landmarkResultSets = await this.landmarkDetector.detectLandmarks(processedInput);

        // Upscale landmarks if needed
        if (scaleFactor !== 1) {
          landmarkResultSets = this.upscaleLandmarks(landmarkResultSets, scaleFactor);
        }

        // Map the UPSCALED faces to the UPSCALED landmarks
        const facesWithLandmarks = this.mapFacesToLandmarks(upscaledFaces, landmarkResultSets);
        
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
   * @param landmarkResultSets Detected landmark sets
   * @returns Combined faces with landmarks
   * @private
   */
  private mapFacesToLandmarks(
    faces: PossiblyTrackedFace[],
    landmarkResultSets: Array<{ meshPoints: Point3D[] }>
  ): PossiblyTrackedFaceDetectionWithLandmarks[] {
    return faces.map((face, index) => {
      return {
        ...face,
        landmarks: landmarkResultSets[index] || { meshPoints: [] }
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
    // Ensure downscale threshold is updated if provided
    this.options.downscaleWidthThreshold = options.downscaleWidthThreshold ?? this.options.downscaleWidthThreshold;
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

  /**
   * Upscales face bounding boxes by a given factor.
   * @private
   */
  private upscaleBox(box: Box, scaleFactor: number): Box {
    return {
      x: box.x / scaleFactor,
      y: box.y / scaleFactor,
      width: box.width / scaleFactor,
      height: box.height / scaleFactor,
    };
  }

  /**
   * Upscales a list of faces (bounding boxes) by a given factor.
   * @private
   */
  private upscaleFaces(faces: PossiblyTrackedFace[], scaleFactor: number): PossiblyTrackedFace[] {
    return faces.map(face => ({
      ...face,
      detection: {
        ...face.detection,
        box: this.upscaleBox(face.detection.box, scaleFactor),
      },
    }));
  }

  /**
   * Upscales landmark points by a given factor.
   * @private
   */
  private upscaleLandmarks(landmarkSets: Array<{ meshPoints: Point3D[] }>, scaleFactor: number): Array<{ meshPoints: Point3D[] }> {
    return landmarkSets.map(landmarkSet => ({
      ...landmarkSet,
      meshPoints: landmarkSet.meshPoints.map(p => ({
        x: p.x / scaleFactor,
        y: p.y / scaleFactor,
        // Z coordinate is not scaled
        z: p.z,
      })),
    }));
  }
} 