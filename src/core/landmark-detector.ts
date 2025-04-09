/**
 * Facial landmark detector implementation
 */
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { BaseDetector } from './base-detector';
import { LandmarkDetectorError, ModelInitializationError } from '../types/errors';
import { MediaElement, DetectionOptions, Point3D } from '../types/types';
import { Logger } from '../services/logger-service';
import { 
  FaceLandmarksDetector,
  Face,
  Keypoint,
  MediaPipeFaceMeshMediaPipeModelConfig,
  MediaPipeFaceMeshTfjsModelConfig
} from '@tensorflow-models/face-landmarks-detection';

/**
 * Configuration for MediaPipe Face Mesh landmark detection model
 */
export interface LandmarkDetectorConfig {
  runtime: 'mediapipe' | 'tfjs';
  refineLandmarks: boolean;
  maxFaces: number;
  staticImageMode?: boolean;
  flipHorizontal?: boolean;
}

/**
 * Face detection result with full mesh
 */
export interface FaceLandmarkResult {
  meshPoints: Point3D[];
}

/**
 * Responsible for detecting facial landmarks using the MediaPipe Face Mesh model
 */
export class LandmarkDetector extends BaseDetector {
  private detector: FaceLandmarksDetector | null = null;
  private config: LandmarkDetectorConfig;

  /**
   * Creates a new landmark detector
   */
  constructor(options?: DetectionOptions) {
    super(options);
    
    this.config = {
      runtime: 'tfjs',
      refineLandmarks: true,
      maxFaces: options?.maxFaces || 1,
      staticImageMode: false,
      flipHorizontal: false
    };
  }

  /**
   * Ensures the detector is loaded before use
   */
  private async ensureDetectorLoaded(): Promise<void> {
    if (this.isDisposed) {
      throw new LandmarkDetectorError('Detector has been disposed and cannot be used again');
    }

    if (!this.detector) {
      try {
        await this.ensureTensorflowBackend();
        
        const modelConfig: MediaPipeFaceMeshMediaPipeModelConfig | MediaPipeFaceMeshTfjsModelConfig = {
          runtime: this.config.runtime,
          maxFaces: this.config.maxFaces,
          refineLandmarks: this.config.refineLandmarks
        };

        // Create detector with MediaPipe face mesh model
        this.detector = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          modelConfig
        );

        Logger.debug(`Landmark detector created with runtime: ${this.config.runtime}`);
      } catch (error) {
        throw new ModelInitializationError(
          `Failed to initialize landmark detector: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  /**
   * Maps TensorFlow.js model keypoints to our standard Point3D format
   */
  private processTensorflowKeypoints(meshPoints: Keypoint[]): Point3D[] {
    return meshPoints.map((point: Keypoint) => ({
      x: point.x,
      y: point.y,
      z: point.z || 0
    }));
  }

  /**
   * Detects the full facial mesh in an image or video
   */
  public async detectLandmarks(
    input: MediaElement
  ): Promise<Array<FaceLandmarkResult>> {
    if (this.isDisposed) {
      throw new LandmarkDetectorError('Detector has been disposed');
    }

    await this.ensureDetectorLoaded();

    if (!this.detector) {
      throw new ModelInitializationError('Detector not initialized');
    }

    try {
      const faces = await this.detector.estimateFaces(input as HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, {
        flipHorizontal: this.config.flipHorizontal,
        staticImageMode: this.config.staticImageMode
      });

      return faces.map((face: Face) => ({
        meshPoints: this.processTensorflowKeypoints(face.keypoints)
      }));
    } catch (error) {
      throw new LandmarkDetectorError(
        `Failed to detect landmarks: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Called when options are updated
   */
  protected onOptionsUpdated(): void {
    if (this.options.maxFaces !== undefined) {
      this.config.maxFaces = this.options.maxFaces;
    }
    
    if (this.options.scoreThreshold !== undefined) {
      (this.config as { scoreThreshold?: number }).scoreThreshold = this.options.scoreThreshold;
    }
    
    if (this.options.enableTracking !== undefined) {
      this.config.staticImageMode = !this.options.enableTracking;
    }
    
    if (this.options.runtime !== undefined) {
      this.config.runtime = this.options.runtime as 'mediapipe' | 'tfjs';
    }
    
    if (this.detector) {
      // Reset detector to apply new config
      this.detector = null;
    }
  }

  /**
   * Called for model preloading/warmup
   */
  protected async onWarmup(): Promise<void> {
    if (!this.detector) {
      await this.ensureDetectorLoaded();
    }
    
    try {
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, 100, 100);
          
          try {
            await this.detectLandmarks(canvas);
          } catch (error) {
            Logger.debug('Dummy detection failed during preloading (expected)', error as Error);
          }
        }
      } else if (this.environment === 'node') {
        Logger.debug('Node.js environment detected, loading model without dummy canvas');
      } else {
        Logger.debug(`Environment ${this.environment} detected, skipping preloading with canvas`);
      }
    } catch (error) {
      Logger.warn('Unexpected error during landmark detector preloading', error as Error);
    }
  }

  /**
   * Called when the detector is disposed
   */
  protected onDispose(): void {
    if (this.detector) {
      try {
        if (typeof this.detector.dispose === 'function') {
          this.detector.dispose();
        }
      } catch (error) {
        Logger.debug('Error while disposing landmark detector (ignored)', error as Error);
      }
      this.detector = null;
    }
  }
} 