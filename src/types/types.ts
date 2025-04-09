/**
 * Core type definitions for face detection
 */

/**
 * 2D point
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 3D point
 */
export interface Point3D extends Point {
  z: number;
}

/**
 * Bounding box
 */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Supported input types
 */
export enum InputType {
  IMAGE = 'image',
  VIDEO = 'video',
  CANVAS = 'canvas'
}

/**
 * Supported model types
 */
export enum ModelType {
  MEDIAPIPE_FACE = 'mediapipe',
  SHORT = 'short'
}

/**
 * TensorFlow runtime
 */
export type TensorFlowRuntime = 'tfjs' | 'mediapipe' | 'tflite';

/**
 * Supported input elements
 */
export type MediaElement = 
  | HTMLImageElement 
  | HTMLVideoElement 
  | HTMLCanvasElement 
  | NodeCanvasElement;

/**
 * Node.js Canvas Element
 */
export interface NodeCanvasElement {
  width: number;
  height: number;
  getContext(contextId: string): CanvasRenderingContext2D | null;
  toBuffer(mime?: string, config?: unknown): Buffer;
}

/**
 * Supported environments
 */
export type Environment = 'browser' | 'node' | 'react-native';

/**
 * Detection configuration options
 */
export interface DetectionOptions {
  /** Confidence threshold (0 to 1) */
  scoreThreshold?: number;
  /** Maximum number of faces to detect */
  maxFaces?: number;
  /** Enable tracking between frames */
  enableTracking?: boolean;
  /** Execution environment */
  environment?: Environment;
  /** Model type to use */
  modelType?: ModelType | string;
  /** TensorFlow runtime */
  runtime?: TensorFlowRuntime;
  /** Target width to downscale input images if they exceed this size. Set to 0 or undefined to disable. */
  downscaleWidthThreshold?: number;
}

/**
 * Face detection result
 */
export interface FaceDetection {
  detection: {
    box: Box;
    score: number;
  };
}

/**
 * Facial landmarks (as a full mesh)
 */
export interface FaceLandmarks {
  meshPoints: Point3D[];
  probability?: number[];
}

/**
 * Face detection with landmarks (as a mesh)
 */
export interface FaceDetectionWithLandmarks {
  detection: {
    box: Box;
    score: number;
  };
  landmarks: FaceLandmarks;
}

/**
 * Face with tracking ID
 */
export interface TrackedFace extends FaceDetection {
  trackingID: number;
}

/**
 * Face detection that may include tracking
 */
export type PossiblyTrackedFace = FaceDetection | TrackedFace;

/**
 * Check if a face has tracking ID
 */
export function isTrackedFace(face: PossiblyTrackedFace): face is TrackedFace {
  return 'trackingID' in face && typeof (face as TrackedFace).trackingID === 'number';
}

/**
 * Face detection with landmarks and tracking
 */
export interface TrackedFaceDetectionWithLandmarks extends FaceDetectionWithLandmarks {
  trackingID: number;
}

/**
 * Face detection with landmarks that may include tracking
 */
export type PossiblyTrackedFaceDetectionWithLandmarks = FaceDetectionWithLandmarks | TrackedFaceDetectionWithLandmarks;

/**
 * Check if a face with landmarks has tracking ID
 */
export function isTrackedFaceWithLandmarks(
  face: PossiblyTrackedFaceDetectionWithLandmarks
): face is TrackedFaceDetectionWithLandmarks {
  return 'trackingID' in face && typeof (face as TrackedFaceDetectionWithLandmarks).trackingID === 'number';
}

/**
 * Detection results
 */
export interface DetectionResult<T> {
  faces: T[];
  timing?: {
    total: number;
    preprocessing?: number;
    inference?: number;
    postprocessing?: number;
  };
} 