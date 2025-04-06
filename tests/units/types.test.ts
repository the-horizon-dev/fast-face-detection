import { 
  Point, 
  Box, 
  InputType, 
  DetectionOptions, 
  FaceDetection, 
  FaceLandmarks, 
  FaceDetectionWithLandmarks,
  TrackedFace
} from '../../src/types/types';

describe('Tipos', () => {
  it('deve verificar tipo Point', () => {
    const point: Point = { x: 10, y: 20 };
    expect(point.x).toBe(10);
    expect(point.y).toBe(20);
  });
  
  it('deve verificar tipo Box', () => {
    const box: Box = { x: 10, y: 20, width: 100, height: 200 };
    expect(box.x).toBe(10);
    expect(box.y).toBe(20);
    expect(box.width).toBe(100);
    expect(box.height).toBe(200);
  });
  
  it('deve verificar enum InputType', () => {
    expect(InputType.IMAGE).toBe('image');
    expect(InputType.VIDEO).toBe('video');
    expect(InputType.CANVAS).toBe('canvas');
    
    // Verificar se os valores são distintos
    const values = Object.values(InputType);
    expect(values.length).toBe(3);
    expect(new Set(values).size).toBe(3);
  });
  
  it('deve verificar interface DetectionOptions', () => {
    const options: DetectionOptions = {
      scoreThreshold: 0.5,
      maxFaces: 10,
      enableTracking: true
    };
    
    expect(options.scoreThreshold).toBe(0.5);
    expect(options.maxFaces).toBe(10);
    expect(options.enableTracking).toBe(true);
  });
  
  it('deve verificar interface FaceDetection', () => {
    const detection: FaceDetection = {
      detection: {
        box: { x: 10, y: 20, width: 100, height: 200 },
        score: 0.95
      }
    };
    
    expect(detection.detection.box.x).toBe(10);
    expect(detection.detection.score).toBe(0.95);
  });
  
  it('deve verificar interface FaceLandmarks', () => {
    const landmarks: FaceLandmarks = {
      positions: [
        { x: 10, y: 20 },
        { x: 30, y: 40 }
      ]
    };
    
    expect(landmarks.positions.length).toBe(2);
    expect(landmarks.positions[0].x).toBe(10);
  });
  
  it('deve verificar interface FaceDetectionWithLandmarks', () => {
    const detectionWithLandmarks: FaceDetectionWithLandmarks = {
      detection: {
        box: { x: 10, y: 20, width: 100, height: 200 },
        score: 0.95
      },
      landmarks: {
        positions: [
          { x: 10, y: 20 },
          { x: 30, y: 40 }
        ]
      }
    };
    
    expect(detectionWithLandmarks.detection.score).toBe(0.95);
    expect(detectionWithLandmarks.landmarks.positions.length).toBe(2);
  });
  
  it('deve verificar interface TrackedFace', () => {
    const trackedFace: TrackedFace = {
      detection: {
        box: { x: 10, y: 20, width: 100, height: 200 },
        score: 0.95
      },
      trackingID: 123
    };
    
    expect(trackedFace.detection.score).toBe(0.95);
    expect(trackedFace.trackingID).toBe(123);
  });
}); 