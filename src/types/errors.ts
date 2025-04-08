/**
 * Error definitions for face detection
 */

/**
 * Error codes for the facial detection package
 */
export enum ErrorCode {
  // Generic error codes
  UNKNOWN_ERROR = 0,
  INVALID_INPUT = 1,
  
  // Initialization error codes
  MODEL_LOAD_FAILED = 100,
  BACKEND_INITIALIZATION_FAILED = 101,
  UNSUPPORTED_ENVIRONMENT = 102,
  
  // Detection error codes
  DETECTION_FAILED = 200,
  NO_FACES_DETECTED = 201,
  TRACKING_ERROR = 202,
  
  // Landmark error codes
  LANDMARK_DETECTION_FAILED = 300,
  
  // Resource error codes
  RESOURCE_EXHAUSTED = 400,
  RESOURCE_DISPOSED = 401
}

/**
 * Additional error information
 */
export interface ErrorDetails {
  code: ErrorCode;
  originalError?: Error;
  context?: Record<string, unknown>;
}

/**
 * Base error class for facial detection
 */
export class FaceDetectionError extends Error {
  public readonly code: ErrorCode;
  public readonly originalError?: Error;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, details?: ErrorDetails) {
    super(message);
    this.name = 'FaceDetectionError';
    this.code = details?.code ?? ErrorCode.UNKNOWN_ERROR;
    this.originalError = details?.originalError;
    this.context = details?.context;
  }

  public toString(): string {
    let result = `${this.name} [${this.code}]: ${this.message}`;
    if (this.originalError) {
      result += `\nCaused by: ${this.originalError.message}`;
    }
    return result;
  }

  public static fromError(error: Error, code: ErrorCode = ErrorCode.UNKNOWN_ERROR): FaceDetectionError {
    return new FaceDetectionError(error.message, { 
      code,
      originalError: error 
    });
  }
}

/**
 * Error for facial detection failures
 */
export class FaceDetectorError extends FaceDetectionError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, details);
    this.name = 'FaceDetectorError';
  }
}

/**
 * Error for landmark detection failures
 */
export class LandmarkDetectorError extends FaceDetectionError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, details);
    this.name = 'LandmarkDetectorError';
  }
}

/**
 * Error for model initialization failures
 */
export class ModelInitializationError extends FaceDetectionError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, details);
    this.name = 'ModelInitializationError';
  }
}

/**
 * Error for invalid inputs
 */
export class InvalidInputError extends FaceDetectionError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, { 
      code: ErrorCode.INVALID_INPUT,
      context
    });
    this.name = 'InvalidInputError';
  }
} 