/**
 * Validation service for inputs and options
 */
import { MediaElement, NodeCanvasElement } from '../types/types';
import { FaceDetectionError } from '../types/errors';

export class ValidationService {
  /**
   * Validates if the media input is valid
   */
  static validateInput(input: MediaElement): void {
    if (!input) {
      throw new FaceDetectionError('Invalid input: media element cannot be null or undefined');
    }
    
    // Check if it's one of the supported types
    const isHTMLElement = 
      input instanceof HTMLImageElement || 
      input instanceof HTMLVideoElement || 
      input instanceof HTMLCanvasElement;
    
    // Check if it's a Node.js Canvas
    const isNodeCanvas = 
      typeof input === 'object' && 
      input !== null &&
      'width' in input && 
      'height' in input && 
      'getContext' in input &&
      typeof (input as NodeCanvasElement).getContext === 'function';
    
    if (!isHTMLElement && !isNodeCanvas) {
      throw new FaceDetectionError('Invalid input: element must be an HTML image, video, canvas, or Node.js canvas');
    }
  }
  
  /**
   * Validates if the API has not been disposed
   */
  static validateDisposed(isDisposed: boolean): void {
    if (isDisposed) {
      throw new FaceDetectionError('API has been disposed and cannot be used again');
    }
  }
  
  /**
   * Validates if the options are valid
   */
  static validateOptions(options: Record<string, any>): void {
    if (options.scoreThreshold !== undefined && (options.scoreThreshold < 0 || options.scoreThreshold > 1)) {
      throw new FaceDetectionError('scoreThreshold must be between 0 and 1');
    }
    
    if (options.maxFaces !== undefined && options.maxFaces < 1) {
      throw new FaceDetectionError('maxFaces must be greater than 0');
    }
  }
} 