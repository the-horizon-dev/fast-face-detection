// Mock do browser Canvas API
class CanvasRenderingContext2DMock {
  fillStyle: string = '#000000';
  strokeStyle: string = '#000000';
  lineWidth: number = 1;

  beginPath() {}
  arc() {}
  fill() {}
  stroke() {}
  strokeRect() {}
  fillRect() {}
  drawImage() {}
}

// Mock do elemento Canvas para testes
HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation(() => {
  return new CanvasRenderingContext2DMock();
});

// Mock global para TensorFlow.js
jest.mock('@tensorflow/tfjs-core', () => ({
  browser: {
    fromPixels: jest.fn().mockReturnValue({
      div: jest.fn().mockReturnThis(),
      expandDims: jest.fn().mockReturnThis(),
      reshape: jest.fn().mockReturnThis(),
      dispose: jest.fn()
    })
  }
}));

// Mock para o detector facial
jest.mock('@tensorflow-models/face-detection', () => ({
  SupportedModels: {
    MediaPipeFaceDetector: 'MediaPipeFaceDetector'
  },
  createDetector: jest.fn().mockImplementation(() => ({
    estimateFaces: jest.fn().mockResolvedValue([
      {
        box: {
          xMin: 100,
          yMin: 50,
          width: 200,
          height: 200
        },
        score: 0.95
      }
    ])
  }))
}));

// Mock para o detector de landmarks
jest.mock('@tensorflow-models/face-landmarks-detection', () => ({
  SupportedModels: {
    MediaPipeFaceMesh: 'MediaPipeFaceMesh'
  },
  createDetector: jest.fn().mockImplementation(() => ({
    estimateFaces: jest.fn().mockResolvedValue([
      {
        keypoints: Array(468).fill(null).map((_, i) => ({
          x: 100 + (i % 20),
          y: 50 + Math.floor(i / 20),
          z: 0
        }))
      }
    ])
  }))
})); 