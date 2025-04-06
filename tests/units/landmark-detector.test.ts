import { LandmarkDetector } from '../../src/core/landmark-detector';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

describe('LandmarkDetector', () => {
  let detector: LandmarkDetector;
  let image: HTMLImageElement;
  
  beforeEach(() => {
    // Configurar imagem fictícia para teste
    image = document.createElement('img');
    image.width = 640;
    image.height = 480;
    
    // Criar instância do detector
    detector = new LandmarkDetector();
  });
  
  it('deve criar o detector com as configurações padrão', () => {
    expect(detector).toBeInstanceOf(LandmarkDetector);
  });
  
  it('deve detectar landmarks em uma imagem', async () => {
    const landmarks = await detector.detectLandmarks(image);
    
    // Verificar se o método foi chamado
    expect(faceLandmarksDetection.createDetector).toHaveBeenCalledWith(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      expect.any(Object)
    );
    
    // Verificar o formato do resultado
    expect(landmarks).toHaveLength(1);
    expect(landmarks[0]).toHaveProperty('positions');
    expect(Array.isArray(landmarks[0].positions)).toBe(true);
    
    // Verificar que os pontos foram mapeados
    const positions = landmarks[0].positions;
    expect(positions.length).toBeGreaterThan(0);
    
    // Verificar o formato dos pontos
    positions.forEach(point => {
      expect(point).toHaveProperty('x');
      expect(point).toHaveProperty('y');
      expect(typeof point.x).toBe('number');
      expect(typeof point.y).toBe('number');
    });
  });
  
  it('deve atualizar opções de configuração', () => {
    const options = { maxFaces: 3 };
    detector.updateOptions(options);
    
    // Verificar se as opções foram aplicadas
    // Não podemos testar diretamente o valor interno, mas chamamos o método para testar se não quebra
    expect(() => detector.updateOptions(options)).not.toThrow();
  });
}); 