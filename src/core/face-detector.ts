/**
 * @file Face detector implementation
 * 
 * This file implements the core facial detection functionality using the
 * MediaPipe FaceDetector model through TensorFlow.js.
 */
import * as faceDetection from '@tensorflow-models/face-detection';
import { 
  DetectionOptions, 
  PossiblyTrackedFace, 
  MediaElement, 
  DetectionResult
} from '../types/types';
import { 
  FaceDetectorError, 
  ModelInitializationError, 
  ErrorCode 
} from '../types/errors';
import { BaseDetector } from './base-detector';
import { Logger } from '../services/logger-service';
import { 
  MediaPipeFaceDetectorMediaPipeModelConfig,
  MediaPipeFaceDetectorTfjsModelConfig 
} from '@tensorflow-models/face-detection';

/**
 * Maps library configuration to TensorFlow model configuration for BlazeFace short-range
 */
function mapConfigToTfConfig(config: DetectionOptions): MediaPipeFaceDetectorTfjsModelConfig {
  const tfConfig: MediaPipeFaceDetectorTfjsModelConfig = {
    runtime: 'tfjs',
    modelType: 'short',
  };
  
  if (config.scoreThreshold !== undefined) {
    (tfConfig as any).scoreThreshold = config.scoreThreshold;
  }
  
  if (config.maxFaces !== undefined) {
    tfConfig.maxFaces = config.maxFaces;
  } else {
    tfConfig.maxFaces = 10;
  }
  
  return tfConfig;
}

/**
 * Responsible for detecting faces in images and videos
 */
export class FaceDetector extends BaseDetector {
  private detector: faceDetection.FaceDetector | null = null;
  private config: DetectionOptions;

  /**
   * Creates a new face detector
   */
  constructor(options?: DetectionOptions) {
    super(options);
    this.config = this.options;
  }

  /**
   * Ensures the detector is loaded before use
   */
  private async ensureDetectorLoaded(): Promise<void> {
    if (this.isDisposed) {
      throw new FaceDetectorError('Detector has been disposed and cannot be used again', {
        code: ErrorCode.RESOURCE_DISPOSED
      });
    }

    if (!this.detector) {
      try {
        await this.ensureTensorflowBackend();
        
        const tfConfig = mapConfigToTfConfig(this.config);
        
        this.detector = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          tfConfig
        );
      } catch (error) {
        throw new ModelInitializationError(
          `Failed to initialize face detector: ${error instanceof Error ? error.message : 'Unknown error'}`,
          {
            code: ErrorCode.MODEL_LOAD_FAILED,
            originalError: error instanceof Error ? error : undefined
          }
        );
      }
    }
  }

  /**
   * Maps detected faces to the internal format
   */
  private mapDetectedFaces(detectedFaces: Array<faceDetection.Face>): PossiblyTrackedFace[] {
    return detectedFaces.map(face => {
      const score = (face as any).score ?? (face as any).confidence ?? (face.keypoints && face.keypoints[0]?.score) ?? 0;
      
      const detection = {
        score: score,
        box: {
          x: face.box.xMin,
          y: face.box.yMin,
          width: face.box.width,
          height: face.box.height
        }
      };
      
      if ('trackingID' in face && face.trackingID !== undefined) {
        return {
          detection,
          trackingID: face.trackingID
        };
      }
      
      return { detection };
    });
  }

  /**
   * Detects faces in an image or video
   */
  public async detectFaces(
    input: MediaElement
  ): Promise<DetectionResult<PossiblyTrackedFace>> {
    if (this.isDisposed) {
      throw new FaceDetectorError('Detector has been disposed and cannot be used again', {
        code: ErrorCode.RESOURCE_DISPOSED
      });
    }

    if (!input) {
      throw new FaceDetectorError('Invalid input: media element cannot be null or undefined', {
        code: ErrorCode.INVALID_INPUT
      });
    }

    const startTime = performance.now();
    let preprocessingTime = 0;
    let inferenceTime = 0;
    let postprocessingTime = 0;
    
    try {
      await this.ensureDetectorLoaded();
      
      preprocessingTime = performance.now() - startTime;
      
      const inferenceStartTime = performance.now();
      
      const detectedFaces = await this.detector!.estimateFaces(input as any);
      
      inferenceTime = performance.now() - inferenceStartTime;
      
      const postprocessingStartTime = performance.now();
      
      const processedFaces = this.mapDetectedFaces(detectedFaces);
      
      postprocessingTime = performance.now() - postprocessingStartTime;
      
      const totalTime = performance.now() - startTime;
      
      Logger.performance('Face detection', totalTime);
      
      return {
        faces: processedFaces,
        timing: {
          total: totalTime,
          preprocessing: preprocessingTime,
          inference: inferenceTime,
          postprocessing: postprocessingTime
        }
      };
    } catch (error) {
      throw new FaceDetectorError(
        `Failed to detect faces: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          code: ErrorCode.DETECTION_FAILED,
          originalError: error instanceof Error ? error : undefined
        }
      );
    }
  }

  /**
   * Called when options are updated
   */
  protected onOptionsUpdated(): void {
    this.config = this.options;
    
    if (this.detector) {
      this.detector = null;
    }
  }

  /**
   * Called for model preloading/warmup
   */
  protected async onWarmup(): Promise<void> {
    await this.ensureDetectorLoaded();
    
    if (typeof document !== 'undefined') {
      try {
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.width = 100;
        canvas.height = 100;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, 100, 100);
          
          try {
            await this.detectFaces(canvas);
          } catch (error) {
            Logger.debug('Dummy detection failed during preloading (expected)', error as Error);
          }
        }
      } catch (error) {
        Logger.debug('Error during face detector warmup', error as Error);
      }
    }
  }

  /**
   * Called when the detector is disposed
   */
  protected onDispose(): void {
    if (this.detector) {
      try {
        this.detector.dispose();
      } catch (error) {
        Logger.debug('Error while disposing detector (ignored)', error as Error);
      }
      this.detector = null;
    }
  }
} 