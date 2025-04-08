/**
 * Base detector class for face detection
 */
import { DetectionOptions } from '../types/types';
import { initTensorflowBackend } from '../utils/tensorflow-utils';
import { FaceDetectionError } from '../types/errors';
import { Logger } from '../services/logger-service';
import { Environment } from '../types/types';

/**
 * Abstract base class for all detectors
 */
export abstract class BaseDetector {
  /** Flag indicating if the detector has been disposed */
  protected isDisposed: boolean = false;
  
  /** Current execution environment */
  protected environment: Environment = 'browser';
  
  /** Detection configuration options */
  protected options: DetectionOptions;

  /**
   * Creates a new detector instance with configuration options
   * @param options Configuration options for the detector
   */
  constructor(options?: DetectionOptions) {
    this.options = options || {};
    
    if (this.options.environment) {
      this.environment = this.options.environment;
    }
  }

  /**
   * Ensures TensorFlow backend is initialized
   */
  protected async ensureTensorflowBackend(): Promise<void> {
    if (this.isDisposed) {
      throw new FaceDetectionError('Detector has been disposed and cannot be used again');
    }

    try {
      await initTensorflowBackend(this.environment as any);
    } catch (error) {
      throw new FaceDetectionError(
        `Failed to initialize internal resources: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Updates detector options
   */
  public updateOptions(options: DetectionOptions): void {
    if (this.isDisposed) {
      throw new FaceDetectionError('Detector has been disposed and cannot be used again');
    }

    let optionsChanged = false;
    
    if (options.scoreThreshold !== undefined && this.options.scoreThreshold !== options.scoreThreshold) {
      optionsChanged = true;
    }
    
    if (options.maxFaces !== undefined && this.options.maxFaces !== options.maxFaces) {
      optionsChanged = true;
    }
    
    if (options.enableTracking !== undefined && this.options.enableTracking !== options.enableTracking) {
      optionsChanged = true;
    }
    
    if (options.environment !== undefined && this.environment !== options.environment) {
      this.environment = options.environment;
      optionsChanged = true;
    }
    
    if (optionsChanged) {
      this.options = { ...this.options, ...options };
      this.onOptionsUpdated();
    }
  }

  /**
   * Called when options are updated
   */
  protected abstract onOptionsUpdated(): void;

  /**
   * Releases all resources
   */
  public dispose(): void {
    if (!this.isDisposed) {
      try {
        this.onDispose();
        this.isDisposed = true;
      } catch (error) {
        Logger.warn('Error while disposing resources', error as Error);
      }
    }
  }

  /**
   * Handles resource disposal
   */
  protected abstract onDispose(): void;

  /**
   * Pre-loads model for later use
   */
  public async warmup(): Promise<void> {
    if (this.isDisposed) {
      throw new FaceDetectionError('Detector has been disposed and cannot be used again');
    }
    
    try {
      await this.onWarmup();
    } catch (error) {
      Logger.warn('Error during warmup', error as Error);
    }
  }

  /**
   * Handles model warmup
   */
  protected abstract onWarmup(): Promise<void>;
} 