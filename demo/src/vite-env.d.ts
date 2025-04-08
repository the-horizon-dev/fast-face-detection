/// <reference types="vite/client" />

// Definições para o pacote Fast Face Detection
declare module '@the-horizon-dev/fast-face-detection' {
  export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface Point {
    x: number;
    y: number;
  }

  export interface DetectionOptions {
    scoreThreshold?: number;
    maxFaces?: number;
    enableTracking?: boolean;
  }

  export interface FaceDetection {
    detection: {
      box: Box;
      score: number;
    };
  }

  export interface FaceDetectionWithLandmarks extends FaceDetection {
    landmarks: {
      positions: Point[];
    };
  }

  export class FaceAPI {
    constructor(options?: DetectionOptions);
    detectFaces(
      input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
      options?: DetectionOptions
    ): Promise<FaceDetection[]>;
    detectFacesWithLandmarks(
      input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
      options?: DetectionOptions
    ): Promise<FaceDetectionWithLandmarks[]>;
    updateOptions(options: DetectionOptions): void;
    getOptions(): DetectionOptions;
    dispose(): void;
  }

  export class FaceDetector {
    constructor(options?: DetectionOptions);
    detectFaces(
      input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
    ): Promise<FaceDetection[]>;
    updateOptions(options: DetectionOptions): void;
    dispose(): void;
  }

  export class LandmarkDetector {
    constructor(options?: DetectionOptions);
    detectLandmarks(
      input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
    ): Promise<Array<{ positions: Point[] }>>;
    updateOptions(options: DetectionOptions): void;
    dispose(): void;
  }

  export class ImageUtils {
    static cropFace(canvas: HTMLCanvasElement, box: Box, margin?: number): HTMLCanvasElement;
    static drawLandmarks(canvas: HTMLCanvasElement, points: Point[], color?: string, size?: number): void;
    static drawBox(canvas: HTMLCanvasElement, box: Box, color?: string, lineWidth?: number): void;
    static elementToCanvas(
      element: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
    ): HTMLCanvasElement;
  }

  export const mediapipeFace: {
    detectFaces(
      input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
      options?: DetectionOptions
    ): Promise<FaceDetection[]>;
    detectFacesWithLandmarks(
      input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
      options?: DetectionOptions
    ): Promise<FaceDetectionWithLandmarks[]>;
    dispose(): void;
  };
} 