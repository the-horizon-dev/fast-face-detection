import { FaceAPI } from '../../../src/core/face-api';
import { FaceDetector } from '../../../src/core/face-detector';
import { LandmarkDetector } from '../../../src/core/landmark-detector';
import { DetectionOptions } from '../../../src/types';
import { FaceDetectionError } from '../../../src/types/errors';

// Mock dependencies
jest.mock('../../../src/core/face-detector');
jest.mock('../../../src/core/landmark-detector');
// Mock ValidationService to prevent actual validation
jest.mock('../../../src/services/validation-service', () => ({
  ValidationService: {
    validateInput: jest.fn().mockReturnValue(true),
    validateDisposed: jest.fn((isDisposed) => {
      if (isDisposed) throw new FaceDetectionError('API is disposed');
    }),
    validateOptions: jest.fn().mockReturnValue(true)
  }
}));

// Mock implementations
const mockUpdateOptions = jest.fn();
const mockDetectFaces = jest.fn();
const mockDetectLandmarks = jest.fn();
const mockWarmup = jest.fn();
const mockDispose = jest.fn();

// Set up mock constructor implementations
(FaceDetector as jest.Mock).mockImplementation(() => ({
  updateOptions: mockUpdateOptions,
  detectFaces: mockDetectFaces,
  warmup: mockWarmup,
  dispose: mockDispose
}));

(LandmarkDetector as jest.Mock).mockImplementation(() => ({
  updateOptions: mockUpdateOptions,
  detectLandmarks: mockDetectLandmarks,
  warmup: mockWarmup,
  dispose: mockDispose
}));

describe('FaceAPI', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('constructor', () => {
    test('should initialize with default options when none provided', () => {
      const api = new FaceAPI();
      
      expect(FaceDetector).toHaveBeenCalledTimes(1);
      expect(LandmarkDetector).toHaveBeenCalledTimes(1);
    });
    
    test('should pass options to detectors', () => {
      const options = {
        scoreThreshold: 0.7,
        maxFaces: 5,
        enableTracking: true
      };
      
      const api = new FaceAPI(options);
      
      expect(FaceDetector).toHaveBeenCalledWith(options);
      expect(LandmarkDetector).toHaveBeenCalledWith(options);
    });
  });
  
  describe('updateOptions', () => {
    test('should update options for both detectors', () => {
      const api = new FaceAPI();
      const options = {
        scoreThreshold: 0.8,
        maxFaces: 3
      };
      
      // Clear constructor calls
      jest.clearAllMocks();
      
      // Update options
      api.updateOptions(options);
      
      // Check if updateOptions was called on both detectors
      expect(mockUpdateOptions).toHaveBeenCalledWith(options);
      expect(mockUpdateOptions).toHaveBeenCalledTimes(2); // Once for each detector
    });
    
    test('should throw error if API is disposed', () => {
      const api = new FaceAPI();
      
      // Dispose the API
      (api as any).isDisposed = true;
      
      // Try to update options
      expect(() => {
        api.updateOptions({});
      }).toThrow(FaceDetectionError);
    });
  });
  
  describe('detectFaces', () => {
    test('should call face detector and return result', async () => {
      const api = new FaceAPI();
      // Create a minimal mock that will pass validation
      const mockInput = { 
        width: 100, 
        height: 100,
        getContext: jest.fn().mockReturnValue({})
      };
      
      const mockResult = {
        faces: [{ detection: { box: { x: 0, y: 0, width: 100, height: 100 }, score: 0.9 } }],
        timing: { total: 100 }
      };
      
      // Set up mock return value
      mockDetectFaces.mockResolvedValueOnce(mockResult);
      
      // Detect faces
      const result = await api.detectFaces(mockInput as any);
      
      // Check results
      expect(mockDetectFaces).toHaveBeenCalledWith(mockInput);
      expect(result).toBe(mockResult);
    });
    
    test('should update options if provided', async () => {
      const api = new FaceAPI();
      // Create a minimal mock that will pass validation
      const mockInput = { 
        width: 100, 
        height: 100,
        getContext: jest.fn().mockReturnValue({})
      };
      
      const options = { scoreThreshold: 0.8 };
      
      // Set up mock return value
      mockDetectFaces.mockResolvedValueOnce({ faces: [], timing: {} });
      
      // Detect faces with options
      await api.detectFaces(mockInput as any, options);
      
      // Check if updateOptions was called
      expect(mockUpdateOptions).toHaveBeenCalledWith(options);
      expect(mockUpdateOptions).toHaveBeenCalledTimes(2); // Once for each detector
    });
  });
  
  describe('detectFacesWithLandmarks', () => {
    test('should combine face and landmark detection results', async () => {
      const api = new FaceAPI();
      // Create a minimal mock that will pass validation
      const mockInput = { 
        width: 100, 
        height: 100,
        getContext: jest.fn().mockReturnValue({})
      };
      
      const mockFaceResult = {
        faces: [
          { detection: { box: { x: 0, y: 0, width: 100, height: 100 }, score: 0.9 } }
        ],
        timing: { total: 50 }
      };
      const mockLandmarks = [
        { positions: [{ x: 10, y: 10 }, { x: 20, y: 20 }] }
      ];
      
      // Set up mock return values
      mockDetectFaces.mockResolvedValueOnce(mockFaceResult);
      mockDetectLandmarks.mockResolvedValueOnce(mockLandmarks);
      
      // Detect faces with landmarks
      const result = await api.detectFacesWithLandmarks(mockInput as any);
      
      // Check if both detectors were called
      expect(mockDetectFaces).toHaveBeenCalledWith(mockInput);
      expect(mockDetectLandmarks).toHaveBeenCalledWith(mockInput);
      
      // Check if results were combined correctly
      expect(result.faces).toHaveLength(1);
      expect(result.faces[0].landmarks).toBe(mockLandmarks[0]);
      expect(result.timing).toBeDefined();
    });
    
    test('should return empty array when no faces detected', async () => {
      const api = new FaceAPI();
      // Create a minimal mock that will pass validation
      const mockInput = { 
        width: 100, 
        height: 100,
        getContext: jest.fn().mockReturnValue({})
      };
      
      const mockFaceResult = {
        faces: [],
        timing: { total: 50 }
      };
      
      // Set up mock return value
      mockDetectFaces.mockResolvedValueOnce(mockFaceResult);
      
      // Detect faces with landmarks
      const result = await api.detectFacesWithLandmarks(mockInput as any);
      
      // Check results
      expect(result.faces).toHaveLength(0);
      expect(mockDetectLandmarks).not.toHaveBeenCalled();
    });
  });
  
  describe('warmup', () => {
    test('should call warmup on both detectors', async () => {
      const api = new FaceAPI();
      
      // Set up mock return values
      mockWarmup.mockResolvedValue(undefined);
      
      // Warmup
      await api.warmup();
      
      // Check if both detectors were warmed up
      expect(mockWarmup).toHaveBeenCalledTimes(2); // Once for each detector
    });
  });
  
  describe('dispose', () => {
    test('should dispose both detectors', () => {
      const api = new FaceAPI();
      
      // Dispose
      api.dispose();
      
      // Check if both detectors were disposed
      expect(mockDispose).toHaveBeenCalledTimes(2); // Once for each detector
      
      // Check if API is marked as disposed
      expect((api as any).isDisposed).toBe(true);
    });
    
    test('should not dispose twice', () => {
      const api = new FaceAPI();
      
      // Dispose
      api.dispose();
      api.dispose();
      
      // Check if methods were called only once
      expect(mockDispose).toHaveBeenCalledTimes(2); // Once for each detector, only on first disposal
    });
  });
}); 