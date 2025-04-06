import { FaceAPI } from '../../src/core/face-api';
import { DetectionOptions } from '../../src/types/types';

describe('FaceAPI', () => {
  let api: FaceAPI;
  let image: HTMLImageElement;
  
  beforeEach(() => {
    // Configurar imagem fictícia para teste
    image = document.createElement('img');
    image.width = 640;
    image.height = 480;
    
    // Criar instância da API
    api = new FaceAPI();
  });

  it('deve inicializar com opções padrão', () => {
    const options = api.getOptions();
    expect(options).toBeDefined();
  });
  
  it('deve detectar faces em uma imagem', async () => {
    const faces = await api.detectFaces(image);
    
    expect(faces).toHaveLength(1);
    expect(faces[0]).toHaveProperty('detection.box');
    expect(faces[0].detection.box).toEqual({
      x: 100,
      y: 50,
      width: 200,
      height: 200
    });
  });
  
  it('deve detectar faces com landmarks em uma imagem', async () => {
    const facesWithLandmarks = await api.detectFacesWithLandmarks(image);
    
    expect(facesWithLandmarks).toHaveLength(1);
    expect(facesWithLandmarks[0]).toHaveProperty('detection.box');
    expect(facesWithLandmarks[0]).toHaveProperty('landmarks.positions');
    
    const { positions } = facesWithLandmarks[0].landmarks;
    expect(Array.isArray(positions)).toBe(true);
    expect(positions.length).toBeGreaterThan(0);
  });

  it('deve detectar faces com opções temporárias', async () => {
    const tempOptions: DetectionOptions = { 
      scoreThreshold: 0.8,
      maxFaces: 3
    };
    
    const faces = await api.detectFaces(image, tempOptions);
    
    expect(faces).toHaveLength(1);
    
    // Verificar se as opções temporárias foram aplicadas
    const currentOptions = api.getOptions();
    expect(currentOptions.scoreThreshold).toBe(0.8);
    expect(currentOptions.maxFaces).toBe(3);
  });
  
  it('deve retornar um array vazio se nenhuma face for detectada', async () => {
    // Sobrescrever o mock para este teste específico
    jest.spyOn(api, 'detectFaces').mockResolvedValueOnce([]);
    
    const facesWithLandmarks = await api.detectFacesWithLandmarks(image);
    
    expect(facesWithLandmarks).toEqual([]);
  });

  it('deve manter landmarks vazios quando não há landmarks correspondentes', async () => {
    // Detectar faces retorna 2 faces, mas landmarks retorna apenas 1
    jest.spyOn(api, 'detectFaces').mockResolvedValueOnce([
      { detection: { box: { x: 100, y: 50, width: 200, height: 200 }, score: 0.95 } },
      { detection: { box: { x: 300, y: 150, width: 150, height: 150 }, score: 0.90 } }
    ]);
    
    const result = await api.detectFacesWithLandmarks(image);
    
    expect(result).toHaveLength(2);
    expect(result[0].landmarks.positions.length).toBeGreaterThan(0);
    // A segunda face deve ter landmarks vazios
    expect(result[1].landmarks.positions).toEqual([]);
  });
}); 