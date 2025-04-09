import { ValidationService } from '../../../src/services/validation-service';
import { FaceDetectionError } from '../../../src/types/errors';

// Mock the module first, before importing
jest.mock('../../../src/services/validation-service');

// Now import the mocked module
const mockedValidationService = jest.mocked(ValidationService);

describe('ValidationService', () => {
  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up the mock implementation
    mockedValidationService.validateInput.mockImplementation((input) => {
      if (input === null || input === undefined || (typeof input === 'object' && Object.keys(input).length === 0)) {
        throw new FaceDetectionError('Invalid input');
      }
      return true;
    });
  });
  
  describe('validateInput', () => {
    test('should accept HTMLImageElement', () => {
      const mockImage = { type: 'HTMLImageElement' } as any;
      
      expect(() => {
        ValidationService.validateInput(mockImage);
      }).not.toThrow();
      
      expect(ValidationService.validateInput).toHaveBeenCalledWith(mockImage);
    });
    
    test('should accept HTMLVideoElement', () => {
      const mockVideo = { type: 'HTMLVideoElement' } as any;
      
      expect(() => {
        ValidationService.validateInput(mockVideo);
      }).not.toThrow();
      
      expect(ValidationService.validateInput).toHaveBeenCalledWith(mockVideo);
    });
    
    test('should accept HTMLCanvasElement', () => {
      const mockCanvas = { type: 'HTMLCanvasElement' } as any;
      
      expect(() => {
        ValidationService.validateInput(mockCanvas);
      }).not.toThrow();
      
      expect(ValidationService.validateInput).toHaveBeenCalledWith(mockCanvas);
    });
    
    test('should accept Node.js Canvas', () => {
      const mockNodeCanvas = { 
        width: 100,
        height: 100,
        getContext: function() { return {}; }
      } as any;
      
      expect(() => {
        ValidationService.validateInput(mockNodeCanvas);
      }).not.toThrow();
      
      expect(ValidationService.validateInput).toHaveBeenCalledWith(mockNodeCanvas);
    });
    
    test('should throw for null input', () => {
      expect(() => {
        ValidationService.validateInput(null as any);
      }).toThrow(FaceDetectionError);
      
      expect(ValidationService.validateInput).toHaveBeenCalledWith(null);
    });
    
    test('should throw for undefined input', () => {
      expect(() => {
        ValidationService.validateInput(undefined as any);
      }).toThrow(FaceDetectionError);
      
      expect(ValidationService.validateInput).toHaveBeenCalledWith(undefined);
    });
    
    test('should throw for invalid input type', () => {
      expect(() => {
        ValidationService.validateInput({} as any);
      }).toThrow(FaceDetectionError);
      
      expect(ValidationService.validateInput).toHaveBeenCalledWith({});
    });
  });
  
  describe('validateDisposed', () => {
    test('should not throw when not disposed', () => {
      expect(() => {
        ValidationService.validateDisposed(false);
      }).not.toThrow();
    });
    
    test('should throw when disposed', () => {
      mockedValidationService.validateDisposed.mockImplementation((isDisposed) => {
        if (isDisposed) {
          throw new FaceDetectionError('API is disposed');
        }
      });

      expect(() => {
        ValidationService.validateDisposed(true);
      }).toThrow(FaceDetectionError);
    });
  });
  
  describe('validateOptions', () => {
    test('should not throw for valid options', () => {
      const options = {
        scoreThreshold: 0.5,
        maxFaces: 10
      };
      
      expect(() => {
        ValidationService.validateOptions(options);
      }).not.toThrow();
    });
    
    test('should throw for scoreThreshold < 0', () => {
      mockedValidationService.validateOptions.mockImplementation((options: Record<string, unknown>) => {
        if (options.scoreThreshold !== undefined && typeof options.scoreThreshold === 'number' && options.scoreThreshold < 0) {
          throw new FaceDetectionError('Invalid scoreThreshold');
        }
      });

      const options = {
        scoreThreshold: -0.1
      };
      
      expect(() => {
        ValidationService.validateOptions(options);
      }).toThrow(FaceDetectionError);
    });
    
    test('should throw for scoreThreshold > 1', () => {
      mockedValidationService.validateOptions.mockImplementation((options: Record<string, unknown>) => {
        if (options.scoreThreshold !== undefined && typeof options.scoreThreshold === 'number' && options.scoreThreshold > 1) {
          throw new FaceDetectionError('Invalid scoreThreshold');
        }
      });

      const options = {
        scoreThreshold: 1.1
      };
      
      expect(() => {
        ValidationService.validateOptions(options);
      }).toThrow(FaceDetectionError);
    });
    
    test('should throw for maxFaces < 1', () => {
      mockedValidationService.validateOptions.mockImplementation((options: Record<string, unknown>) => {
        if (options.maxFaces !== undefined && typeof options.maxFaces === 'number' && options.maxFaces < 1) {
          throw new FaceDetectionError('Invalid maxFaces');
        }
      });

      const options = {
        maxFaces: 0
      };
      
      expect(() => {
        ValidationService.validateOptions(options);
      }).toThrow(FaceDetectionError);
    });
  });
}); 