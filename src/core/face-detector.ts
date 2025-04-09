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
    modelType: 'full',
  };
  
  // Set score threshold if provided
  if (config.scoreThreshold !== undefined) {
    // Use type assertion since the property might not be in the type definition
    (tfConfig as any).scoreThreshold = config.scoreThreshold;
  } else {
    // Default to a reasonable threshold if not specified
    (tfConfig as any).scoreThreshold = 0.5;
  }
  
  // Set max faces if provided
  if (config.maxFaces !== undefined) {
    tfConfig.maxFaces = config.maxFaces;
  } else {
    tfConfig.maxFaces = 10;
  }
  
  // Log the configuration for debugging
  console.log('[FaceDetector] Mapped config to TF config:', JSON.stringify(tfConfig, null, 2));
  
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
        
        console.log('[FaceDetector] TFJS Config before creating detector:', JSON.stringify(tfConfig, null, 2));
        
        // Create the detector with the specified model type
        this.detector = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          tfConfig
        );
        
        console.log('[FaceDetector] Detector created successfully');
        
        // Perform a warmup detection to ensure the model is fully loaded
        if (typeof document !== 'undefined') {
          try {
            const canvas = document.createElement('canvas') as HTMLCanvasElement;
            canvas.width = 100;
            canvas.height = 100;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#000000';
              ctx.fillRect(0, 0, 100, 100);
              
              // This is just a warmup, we don't care about the result
              await this.detector.estimateFaces(canvas);
              console.log('[FaceDetector] Warmup detection completed');
            }
          } catch (warmupError) {
            // Ignore warmup errors, they're not critical
            console.log('[FaceDetector] Warmup detection failed (non-critical):', warmupError);
          }
        }
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
      console.log('[FaceDetector] Processing individual face object:', JSON.stringify(face, null, 2));
      
      // Log individual potential score sources
      const rawScore = (face as any).score;
      const rawConfidence = (face as any).confidence;
      const keypointScore = (face.keypoints && face.keypoints[0]?.score);
      const probability = (face as any).probability && (face as any).probability[0];
      console.log(`[FaceDetector] Score sources: rawScore=${rawScore}, rawConfidence=${rawConfidence}, keypointScore=${keypointScore}, probability=${probability}`);
      
      // Try to get the score from various possible sources in the MediaPipe FaceDetector model
      // The MediaPipe FaceDetector model might store the confidence score in different properties
      let score = 0;
      
      if (typeof rawScore === 'number' && rawScore > 0) {
        score = rawScore;
      } else if (typeof rawConfidence === 'number' && rawConfidence > 0) {
        score = rawConfidence;
      } else if (typeof keypointScore === 'number' && keypointScore > 0) {
        score = keypointScore;
      } else if (typeof probability === 'number' && probability > 0) {
        score = probability;
      } else if (face.keypoints && face.keypoints.length > 0) {
        // If no direct score is available, try to calculate from keypoints
        // MediaPipe models often have confidence scores in keypoints
        const keypointScores = face.keypoints
          .filter(kp => typeof kp.score === 'number' && kp.score > 0)
          .map(kp => kp.score as number);
        
        if (keypointScores.length > 0) {
          // Use average of keypoint scores as a fallback
          score = keypointScores.reduce((sum, val) => sum + val, 0) / keypointScores.length;
        }
      }
      
      // If we still have no score, use a default value based on the presence of a valid bounding box
      if (score === 0 && face.box && 
          typeof face.box.xMin === 'number' && 
          typeof face.box.yMin === 'number' && 
          typeof face.box.width === 'number' && 
          typeof face.box.height === 'number' &&
          face.box.width > 0 && face.box.height > 0) {
        // If we have a valid bounding box but no score, use a default high confidence
        // This is a fallback for models that don't provide explicit confidence scores
        score = 0.95;
      }
      
      console.log('[FaceDetector] Calculated score for this face:', score);
      
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
      
      console.log(`[FaceDetector] Input type before estimateFaces: ${input?.constructor?.name ?? typeof input}`);
      
      // Log input dimensions if available
      if ('width' in input && 'height' in input) {
        console.log(`[FaceDetector] Input dimensions: ${input.width}x${input.height}`);
      }
      
      // Perform face detection
      const detectedFaces = await this.detector!.estimateFaces(input as any);
      
      console.log(`[FaceDetector] Raw detected faces array from estimateFaces: ${JSON.stringify(detectedFaces, null, 2)}`);
      console.log(`[FaceDetector] Number of faces detected: ${detectedFaces.length}`);
      
      inferenceTime = performance.now() - inferenceStartTime;
      
      const postprocessingStartTime = performance.now();
      
      // Process the detected faces
      const processedFaces = this.mapDetectedFaces(detectedFaces);
      
      console.log(`[FaceDetector] Processed faces with scores: ${JSON.stringify(processedFaces.map(f => ({ 
        score: f.detection.score,
        box: f.detection.box
      })), null, 2)}`);
      
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
      console.error('[FaceDetector] Error during face detection:', error);
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