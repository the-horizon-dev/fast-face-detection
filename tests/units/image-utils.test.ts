import { ImageUtils } from '../../src/utils/image-utils';
import { Box, Point } from '../../src/types/types';

describe('ImageUtils', () => {
  let canvas: HTMLCanvasElement;
  const testBox: Box = { x: 50, y: 30, width: 100, height: 80 };
  const testPoints: Point[] = [
    { x: 100, y: 50 },
    { x: 120, y: 70 },
    { x: 140, y: 90 }
  ];
  
  beforeEach(() => {
    // Criar canvas para teste
    canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
  });
  
  it('deve recortar uma face de um canvas', () => {
    const faceCanvas = ImageUtils.cropFace(canvas, testBox);
    
    expect(faceCanvas).toBeInstanceOf(HTMLCanvasElement);
    expect(faceCanvas.width).toBe(testBox.width);
    expect(faceCanvas.height).toBe(testBox.height);
  });
  
  it('deve recortar uma face com margem', () => {
    const margin = 0.2; // 20% de margem
    const faceCanvas = ImageUtils.cropFace(canvas, testBox, margin);
    
    expect(faceCanvas).toBeInstanceOf(HTMLCanvasElement);
    expect(faceCanvas.width).toBeGreaterThan(testBox.width);
    expect(faceCanvas.height).toBeGreaterThan(testBox.height);
  });
  
  it('deve desenhar landmarks em um canvas', () => {
    // Este teste apenas verifica se não ocorrem erros
    expect(() => {
      ImageUtils.drawLandmarks(canvas, testPoints);
    }).not.toThrow();
  });
  
  it('deve desenhar uma caixa delimitadora em um canvas', () => {
    // Este teste apenas verifica se não ocorrem erros
    expect(() => {
      ImageUtils.drawBox(canvas, testBox);
    }).not.toThrow();
  });
  
  it('deve converter uma imagem para canvas', () => {
    const img = document.createElement('img');
    img.width = 640;
    img.height = 480;
    
    const resultCanvas = ImageUtils.elementToCanvas(img);
    
    expect(resultCanvas).toBeInstanceOf(HTMLCanvasElement);
    expect(resultCanvas.width).toBe(img.width);
    expect(resultCanvas.height).toBe(img.height);
  });
  
  it('deve converter um vídeo para canvas', () => {
    const video = document.createElement('video');
    Object.defineProperty(video, 'videoWidth', { value: 1280 });
    Object.defineProperty(video, 'videoHeight', { value: 720 });
    
    const resultCanvas = ImageUtils.elementToCanvas(video);
    
    expect(resultCanvas).toBeInstanceOf(HTMLCanvasElement);
    expect(resultCanvas.width).toBe(1280);
    expect(resultCanvas.height).toBe(720);
  });
  
  it('deve retornar o mesmo objeto se já for um canvas', () => {
    const resultCanvas = ImageUtils.elementToCanvas(canvas);
    
    expect(resultCanvas).toBe(canvas); // Deve ser a mesma referência
  });

  describe('drawBox', () => {
    it('deve desenhar uma caixa no canvas', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 200;
      
      // Configurar variáveis para o teste
      const box = { x: 10, y: 20, width: 100, height: 150 };
      
      // Chamar o método e verificar que não lança exceção
      expect(() => {
        ImageUtils.drawBox(canvas, box, 'rgba(255, 0, 0, 0.8)', 3);
      }).not.toThrow();
    });

    it('deve usar valores padrão quando cor e espessura não são fornecidos', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 200;
      
      // Configurar variáveis para o teste
      const box = { x: 10, y: 20, width: 100, height: 150 };
      
      // Chamar o método com valores padrão
      expect(() => {
        ImageUtils.drawBox(canvas, box);
      }).not.toThrow();
    });
  });
}); 