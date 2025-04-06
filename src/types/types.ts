/**
 * Interface para representar um ponto 2D
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Interface para representar uma caixa delimitadora
 */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Enumeração para os tipos de entrada suportados
 */
export enum InputType {
  IMAGE = 'image',
  VIDEO = 'video',
  CANVAS = 'canvas'
}

/**
 * Tipo para elementos de entrada suportados
 */
export type MediaElement = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;

/**
 * Interface para opções de configuração de detecção
 */
export interface DetectionOptions {
  // Limiar de confiança para a detecção (valores de 0 a 1)
  scoreThreshold?: number;
  // Número máximo de faces a serem detectadas
  maxFaces?: number;
  // Habilitar rastreamento entre frames (para vídeo)
  enableTracking?: boolean;
}

/**
 * Resultado de uma detecção facial
 */
export interface FaceDetection {
  detection: {
    box: Box;
    score: number;
  };
}

/**
 * Conjunto de pontos de referência facial (landmarks)
 */
export interface FaceLandmarks {
  positions: Point[];
}

/**
 * Resultado de uma detecção facial com landmarks
 */
export interface FaceDetectionWithLandmarks {
  detection: {
    box: Box;
    score: number;
  };
  landmarks: FaceLandmarks;
}

/**
 * Interface para rastreamento de face (ID único quando enableTracking=true)
 */
export interface TrackedFace extends FaceDetection {
  trackingID?: number;
} 