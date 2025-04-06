import { mediapipeFace, FaceAPI, FaceDetector, LandmarkDetector, 
  FacialLandmarkGroup, FACIAL_LANDMARK_INDICES } from '../../src';

describe('Index Exports', () => {
  let image: HTMLImageElement;
  
  beforeEach(() => {
    // Configurar imagem fictícia para teste
    image = document.createElement('img');
    image.width = 640;
    image.height = 480;
  });

  it('deve exportar função mediapipeFace.detectFaces', async () => {
    const result = await mediapipeFace.detectFaces(image);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('detection.box');
  });

  it('deve exportar função mediapipeFace.detectFacesWithLandmarks', async () => {
    const result = await mediapipeFace.detectFacesWithLandmarks(image);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('detection.box');
    expect(result[0]).toHaveProperty('landmarks.positions');
  });

  it('deve exportar FaceAPI', () => {
    expect(FaceAPI).toBeDefined();
    const api = new FaceAPI();
    expect(api).toBeInstanceOf(FaceAPI);
  });

  it('deve exportar FaceDetector', () => {
    expect(FaceDetector).toBeDefined();
    const detector = new FaceDetector();
    expect(detector).toBeInstanceOf(FaceDetector);
  });

  it('deve exportar LandmarkDetector', () => {
    expect(LandmarkDetector).toBeDefined();
    const detector = new LandmarkDetector();
    expect(detector).toBeInstanceOf(LandmarkDetector);
  });

  it('deve exportar constantes relacionadas a landmarks', () => {
    expect(FacialLandmarkGroup).toBeDefined();
    expect(FACIAL_LANDMARK_INDICES).toBeDefined();
    expect(typeof FACIAL_LANDMARK_INDICES).toBe('object');
  });
}); 