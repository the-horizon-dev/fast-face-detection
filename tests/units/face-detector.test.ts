import { FaceDetector } from '../../src/core/face-detector';
import * as faceDetection from '@tensorflow-models/face-detection';

describe('FaceDetector', () => {
  let detector: FaceDetector;
  let image: HTMLImageElement;
  
  beforeEach(() => {
    // Configurar imagem fictícia para teste
    image = document.createElement('img');
    image.width = 640;
    image.height = 480;
    
    // Criar instância do detector
    detector = new FaceDetector();
  });
  
  it('deve criar o detector com as configurações padrão', () => {
    expect(detector).toBeInstanceOf(FaceDetector);
  });
  
  it('deve detectar faces em uma imagem', async () => {
    const faces = await detector.detectFaces(image);
    
    // Verificar se o método foi chamado
    expect(faceDetection.createDetector).toHaveBeenCalledWith(
      faceDetection.SupportedModels.MediaPipeFaceDetector,
      expect.any(Object)
    );
    
    // Verificar o formato do resultado
    expect(faces).toHaveLength(1);
    expect(faces[0]).toHaveProperty('detection.box');
    expect(faces[0]).toHaveProperty('detection.score');
    
    // Verificar os valores específicos
    expect(faces[0].detection.box).toEqual({
      x: 100,
      y: 50,
      width: 200,
      height: 200
    });
    expect(faces[0].detection.score).toBeCloseTo(0.95);
  });
  
  it('deve atualizar opções de configuração', () => {
    const options = { scoreThreshold: 0.8 };
    detector.updateOptions(options);
    
    // Verificar se as opções foram aplicadas
    // Não podemos testar diretamente o valor interno, mas chamamos o método para testar se não quebra
    expect(() => detector.updateOptions(options)).not.toThrow();
  });
}); 