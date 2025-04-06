import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { DetectionOptions, Point } from '../types/types';
import { FACIAL_LANDMARK_INDICES } from '../constants/landmarks';

/**
 * Configuração padrão para o detector de landmarks faciais MediaPipe
 */
const DEFAULT_CONFIG: faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig = {
  runtime: 'tfjs',
  maxFaces: 1,     // Por padrão, detectamos apenas uma face
  refineLandmarks: false, // Não refinar landmarks para ser mais rápido
};

/**
 * Classe responsável pela detecção de landmarks faciais
 */
export class LandmarkDetector {
  private detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  private config: faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig;

  /**
   * Construtor que permite configuração personalizada
   */
  constructor(options?: DetectionOptions) {
    this.config = { ...DEFAULT_CONFIG };
    
    if (options?.maxFaces) {
      this.config.maxFaces = options.maxFaces;
    }
  }

  /**
   * Garante que o detector seja carregado antes do uso
   */
  private async ensureDetectorLoaded(): Promise<void> {
    if (!this.detector) {
      this.detector = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        this.config
      );
    }
  }

  /**
   * Detecta landmarks em uma imagem ou vídeo
   */
  public async detectLandmarks(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<Array<{ positions: Point[] }>> {
    await this.ensureDetectorLoaded();
    
    const facesWithMesh = await this.detector!.estimateFaces(input);
    
    return facesWithMesh.map(mesh => {
      // Extraímos os pontos de interesse usando os índices definidos
      const positions = FACIAL_LANDMARK_INDICES.map((idx: number) => {
        const point = mesh.keypoints[idx];
        return {
          x: point.x,
          y: point.y
        };
      });
      
      return { positions };
    });
  }

  /**
   * Atualiza as opções de configuração do detector
   */
  public updateOptions(options: DetectionOptions): void {
    if (options.maxFaces) {
      this.config.maxFaces = options.maxFaces;
    }
    
    // Se o detector já estava carregado, precisamos reiniciá-lo
    if (this.detector) {
      this.detector = null;
    }
  }
} 