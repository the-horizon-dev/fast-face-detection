import { 
  FaceDetection, 
  FaceDetectionWithLandmarks, 
  DetectionOptions, 
  MediaElement 
} from '../types/types';
import { FaceDetector } from './face-detector';
import { LandmarkDetector } from './landmark-detector';

/**
 * Classe principal que integra detecção facial e landmarks
 */
export class FaceAPI {
  private faceDetector: FaceDetector;
  private landmarkDetector: LandmarkDetector;
  private options: DetectionOptions;

  /**
   * Inicializa a API com opções personalizadas
   */
  constructor(options: DetectionOptions = {}) {
    this.options = options;
    this.faceDetector = new FaceDetector(options);
    this.landmarkDetector = new LandmarkDetector(options);
  }

  /**
   * Detecta faces em uma imagem ou vídeo
   */
  public async detectFaces(
    input: MediaElement,
    options?: DetectionOptions
  ): Promise<FaceDetection[]> {
    // Aplicar opções temporárias se fornecidas
    if (options) {
      this.updateOptions(options);
    }
    
    return this.faceDetector.detectFaces(input);
  }

  /**
   * Detecta faces com landmarks em uma imagem ou vídeo
   */
  public async detectFacesWithLandmarks(
    input: MediaElement,
    options?: DetectionOptions
  ): Promise<FaceDetectionWithLandmarks[]> {
    // Primeiro detecta as faces
    const faces = await this.detectFaces(input, options);
    
    if (faces.length === 0) {
      return [];
    }
    
    // Em seguida, detecta os landmarks para cada face
    const landmarks = await this.landmarkDetector.detectLandmarks(input);
    
    // Combina os resultados de faces e landmarks
    return faces.map((face, index) => {
      // Se existe landmark para esta face
      if (index < landmarks.length) {
        return {
          detection: face.detection,
          landmarks: landmarks[index]
        };
      }
      
      // Se não há landmark, retorna um array vazio de posições
      return {
        detection: face.detection,
        landmarks: {
          positions: []
        }
      };
    });
  }

  /**
   * Atualiza as opções de configuração
   */
  public updateOptions(options: DetectionOptions): void {
    this.options = { ...this.options, ...options };
    this.faceDetector.updateOptions(this.options);
    this.landmarkDetector.updateOptions(this.options);
  }

  /**
   * Retorna as opções atuais
   */
  public getOptions(): DetectionOptions {
    return { ...this.options };
  }
} 