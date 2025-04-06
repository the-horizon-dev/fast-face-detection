import * as faceDetection from '@tensorflow-models/face-detection';
import { DetectionOptions, FaceDetection } from '../types/types';

/**
 * Configuração para o detector facial MediaPipe
 */
const DEFAULT_CONFIG: faceDetection.MediaPipeFaceDetectorTfjsModelConfig = {
  runtime: 'tfjs',
  modelType: 'short', // Modelo mais leve e rápido
};

/**
 * Classe responsável pela detecção facial
 */
export class FaceDetector {
  private detector: faceDetection.FaceDetector | null = null;
  private config: faceDetection.MediaPipeFaceDetectorTfjsModelConfig;

  /**
   * Construtor que permite configuração personalizada
   */
  constructor(options?: DetectionOptions) {
    this.config = { ...DEFAULT_CONFIG };
    
    if (options?.scoreThreshold) {
      (this.config as any).scoreThreshold = options.scoreThreshold;
    }
  }

  /**
   * Garante que o detector seja carregado antes do uso
   */
  private async ensureDetectorLoaded(): Promise<void> {
    if (!this.detector) {
      this.detector = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        this.config
      );
    }
  }

  /**
   * Detecta faces em uma imagem ou vídeo
   */
  public async detectFaces(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<FaceDetection[]> {
    await this.ensureDetectorLoaded();
    
    const detectedFaces = await this.detector!.estimateFaces(input);
    
    // Converter para o formato padrão da API
    return detectedFaces.map((face: faceDetection.Face) => ({
      detection: {
        box: {
          x: face.box.xMin,
          y: face.box.yMin,
          width: face.box.width,
          height: face.box.height
        },
        score: (face as any).score ?? 0
      }
    }));
  }

  /**
   * Atualiza as opções de configuração do detector
   */
  public updateOptions(options: DetectionOptions): void {
    if (options.scoreThreshold) {
      (this.config as any).scoreThreshold = options.scoreThreshold;
    }
    
    // Se o detector já estava carregado, precisamos reiniciá-lo
    if (this.detector) {
      this.detector = null;
    }
  }
} 