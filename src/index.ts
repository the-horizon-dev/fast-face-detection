// Exporta a API principal
import { FaceAPI } from './core/face-api';

// API simplificada como função para compatibilidade
export const mediapipeFace = {
  detectFaces: async (
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    options?: any
  ) => {
    const api = new FaceAPI(options);
    return api.detectFaces(input);
  },
  
  detectFacesWithLandmarks: async (
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    options?: any
  ) => {
    const api = new FaceAPI(options);
    return api.detectFacesWithLandmarks(input);
  }
};

// Exporta classes principais para uso avançado
export { FaceAPI } from './core/face-api';
export { FaceDetector } from './core/face-detector';
export { LandmarkDetector } from './core/landmark-detector';
export { ImageUtils } from './utils/image-utils';

// Exporta constantes
export { 
  FacialLandmarkGroup, 
  FACIAL_LANDMARK_INDICES, 
  FACIAL_LANDMARK_INDICES_BY_GROUP 
} from './constants/landmarks';

// Exporta tipos
export * from './types/types'; 