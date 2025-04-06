import { FaceAPI } from '../../src/core/face-api';

describe('FaceAPI Integration', () => {
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
  
  it('deve detectar faces em uma imagem', async () => {
    const faces = await api.detectFaces(image);
    
    // Verificar o formato do resultado
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
    
    // Verificar o formato do resultado
    expect(facesWithLandmarks).toHaveLength(1);
    expect(facesWithLandmarks[0]).toHaveProperty('detection.box');
    expect(facesWithLandmarks[0]).toHaveProperty('landmarks.positions');
    
    // Verificar o conteúdo dos landmarks
    const { positions } = facesWithLandmarks[0].landmarks;
    expect(Array.isArray(positions)).toBe(true);
    expect(positions.length).toBeGreaterThan(0);
  });
  
  it('deve permitir atualizar opções de configuração', () => {
    const options = { scoreThreshold: 0.7, maxFaces: 2 };
    
    // Verificar se as opções são aceitas
    expect(() => api.updateOptions(options)).not.toThrow();
    
    // Verificar se as opções foram aplicadas
    const currentOptions = api.getOptions();
    expect(currentOptions).toEqual(expect.objectContaining(options));
  });
  
  it('deve retornar um array vazio se nenhuma face for detectada', async () => {
    // Sobrescrever o mock para este teste específico
    const originalDetectFaces = api.detectFaces;
    api.detectFaces = jest.fn().mockResolvedValue([]);
    
    const facesWithLandmarks = await api.detectFacesWithLandmarks(image);
    
    // Verificar o resultado
    expect(facesWithLandmarks).toEqual([]);
    
    // Restaurar o método original
    api.detectFaces = originalDetectFaces;
  });
}); 