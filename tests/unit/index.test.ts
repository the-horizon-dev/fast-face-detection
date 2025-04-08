import { FaceAPI } from '../../src/core/face-api';
import { mediapipeFace, utils } from '../../src/index';
import { initTensorflowBackend, detectEnvironment } from '../../src/utils';
import { Logger } from '../../src/services';

// Mock dependencies
jest.mock('../../src/core/face-api');
jest.mock('../../src/utils', () => ({
  initTensorflowBackend: jest.fn().mockResolvedValue(undefined),
  detectEnvironment: jest.fn().mockReturnValue('browser')
}));
jest.mock('../../src/services/logger-service', () => ({
  Logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    setLevel: jest.fn() // Mock for the setLevel method
  }
}));

// Reset the mediapipeFace module state between tests
// This is needed because index.ts has a cached instance 
// that persists between test cases
jest.mock('../../src/index', () => {
  const originalModule = jest.requireActual('../../src/index');
  return {
    ...originalModule,
    // Ensure we're exporting the real module functions but with access to our mocks
    mediapipeFace: {
      ...originalModule.mediapipeFace,
      // Override dispose to ensure proper cleanup between tests
      dispose: jest.fn(() => {
        originalModule.mediapipeFace.dispose();
      }),
    },
  };
});

describe('Main API', () => {
  const mockFaceAPI = {
    detectFaces: jest.fn(),
    detectFacesWithLandmarks: jest.fn(),
    warmup: jest.fn().mockResolvedValue(undefined),
    dispose: jest.fn(),
    updateOptions: jest.fn()
  };
  
  // Setup mock constructor implementation and reset state
  beforeEach(() => {
    jest.clearAllMocks();
    (FaceAPI as jest.Mock).mockImplementation(() => mockFaceAPI);
    // Reset module state by calling dispose
    mediapipeFace.dispose();
  });

  describe('mediapipeFace', () => {
    describe('detectFaces', () => {
      test('should initialize FaceAPI and call detectFaces', async () => {
        const mockInput = { width: 100, height: 100 };
        const mockOptions = { scoreThreshold: 0.7 };
        const mockResult = { faces: [{ detection: { score: 0.9 } }], timing: { total: 100 } };
        
        mockFaceAPI.detectFaces.mockResolvedValueOnce(mockResult);
        
        // Call API method
        const result = await mediapipeFace.detectFaces(mockInput as any, mockOptions);
        
        // Verify the FaceAPI was initialized
        expect(FaceAPI).toHaveBeenCalledWith({ ...mockOptions, environment: 'browser' });
        expect(initTensorflowBackend).toHaveBeenCalledWith('browser');
        
        // Verify detectFaces was called
        expect(mockFaceAPI.detectFaces).toHaveBeenCalledWith(mockInput);
        
        // Verify result
        expect(result).toBe(mockResult.faces);
      });
      
      test('should return timing information when withTiming is true', async () => {
        const mockInput = { width: 100, height: 100 };
        const mockResult = { faces: [{ detection: { score: 0.9 } }], timing: { total: 100 } };
        
        mockFaceAPI.detectFaces.mockResolvedValueOnce(mockResult);
        
        // Call API method with withTiming=true
        const result = await mediapipeFace.detectFaces(mockInput as any, undefined, true);
        
        // Verify result includes timing
        expect(result).toBe(mockResult);
      });
      
      test('should reuse cached API instance on subsequent calls', async () => {
        const mockInput = { width: 100, height: 100 };
        const mockResult = { faces: [], timing: {} };
        
        mockFaceAPI.detectFaces.mockResolvedValue(mockResult);
        
        // Reset call count just to be sure
        (FaceAPI as jest.Mock).mockClear();
        
        // First call
        await mediapipeFace.detectFaces(mockInput as any);
        // Second call
        await mediapipeFace.detectFaces(mockInput as any);
        
        // FaceAPI constructor should only be called once
        expect(FaceAPI).toHaveBeenCalledTimes(1);
      });
    });
    
    describe('detectFacesWithLandmarks', () => {
      test('should initialize FaceAPI and call detectFacesWithLandmarks', async () => {
        const mockInput = { width: 100, height: 100 };
        const mockOptions = { scoreThreshold: 0.7 };
        const mockResult = { 
          faces: [{ detection: { score: 0.9 }, landmarks: { positions: [] } }], 
          timing: { total: 100 } 
        };
        
        mockFaceAPI.detectFacesWithLandmarks.mockResolvedValueOnce(mockResult);
        
        // Reset module state
        mediapipeFace.dispose();
        (FaceAPI as jest.Mock).mockClear();
        
        // Call API method
        const result = await mediapipeFace.detectFacesWithLandmarks(mockInput as any, mockOptions);
        
        // Verify the FaceAPI was initialized
        expect(FaceAPI).toHaveBeenCalledWith({ ...mockOptions, environment: 'browser' });
        
        // Verify detectFacesWithLandmarks was called
        expect(mockFaceAPI.detectFacesWithLandmarks).toHaveBeenCalledWith(mockInput);
        
        // Verify result
        expect(result).toBe(mockResult.faces);
      });
      
      test('should return timing information when withTiming is true', async () => {
        const mockInput = { width: 100, height: 100 };
        const mockResult = { 
          faces: [{ detection: { score: 0.9 }, landmarks: { positions: [] } }], 
          timing: { total: 100 } 
        };
        
        mockFaceAPI.detectFacesWithLandmarks.mockResolvedValueOnce(mockResult);
        
        // Call API method with withTiming=true
        const result = await mediapipeFace.detectFacesWithLandmarks(mockInput as any, undefined, true);
        
        // Verify result includes timing
        expect(result).toBe(mockResult);
      });
    });
    
    describe('initialize', () => {
      test('should initialize FaceAPI and call warmup', async () => {
        const mockOptions = { scoreThreshold: 0.8 };
        
        // Reset module state
        mediapipeFace.dispose();
        (FaceAPI as jest.Mock).mockClear();
        
        // Call initialize
        const result = await mediapipeFace.initialize(mockOptions);
        
        // Verify API initialization
        expect(FaceAPI).toHaveBeenCalledWith({ ...mockOptions, environment: 'browser' });
        
        // Verify warmup was called
        expect(mockFaceAPI.warmup).toHaveBeenCalled();
        
        // Verify result is the environment
        expect(result).toBe('browser');
      });
    });
    
    describe('dispose', () => {
      test('should call dispose on the FaceAPI instance', async () => {
        // Initialize API first
        await mediapipeFace.detectFaces({ width: 100, height: 100 } as any);
        
        // Reset mock to check for calls after initialization
        mockFaceAPI.dispose.mockClear();
        
        // Dispose
        mediapipeFace.dispose();
        
        // Verify dispose was called
        expect(mockFaceAPI.dispose).toHaveBeenCalled();
      });
    });
  });
  
  describe('utils', () => {
    describe('setLogLevel', () => {
      test('should call Logger.setLevel with the provided level', () => {
        utils.setLogLevel('debug');
        
        // Use type assertion to match our mocked interface
        expect((Logger as any).setLevel).toHaveBeenCalledWith('debug');
      });
    });
    
    test('should export VERSION', () => {
      expect(utils.VERSION).toBeDefined();
      expect(typeof utils.VERSION).toBe('string');
    });
  });
}); 