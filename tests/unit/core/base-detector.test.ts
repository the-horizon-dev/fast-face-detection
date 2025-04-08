import { BaseDetector } from '../../../src/core/base-detector';
import { DetectionOptions } from '../../../src/types/types';
import { FaceDetectionError } from '../../../src/types/errors';
import { initTensorflowBackend } from '../../../src/utils/tensorflow-utils';

// Mock dependencies
jest.mock('../../../src/utils/tensorflow-utils', () => ({
  initTensorflowBackend: jest.fn().mockResolvedValue(undefined)
}));

// Test implementation of abstract class
class TestDetector extends BaseDetector {
  public onOptionsUpdatedCalled = false;
  public onDisposeCalled = false;
  public onWarmupCalled = false;

  protected onOptionsUpdated(): void {
    this.onOptionsUpdatedCalled = true;
  }

  protected onDispose(): void {
    this.onDisposeCalled = true;
  }

  protected async onWarmup(): Promise<void> {
    this.onWarmupCalled = true;
  }

  // Expose protected methods and properties for testing
  public getOptions(): DetectionOptions {
    return this.options;
  }

  public getEnvironment(): string {
    return this.environment;
  }

  public getIsDisposed(): boolean {
    return this.isDisposed;
  }

  public async testEnsureTensorflowBackend(): Promise<void> {
    return this.ensureTensorflowBackend();
  }
}

describe('BaseDetector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with default options when none provided', () => {
      const detector = new TestDetector();
      
      expect(detector.getOptions()).toEqual({});
      expect(detector.getEnvironment()).toBe('browser');
    });
    
    test('should initialize with provided options', () => {
      const options: DetectionOptions = {
        scoreThreshold: 0.7,
        maxFaces: 5,
        enableTracking: true,
        environment: 'node'
      };
      
      const detector = new TestDetector(options);
      
      expect(detector.getOptions()).toEqual(options);
      expect(detector.getEnvironment()).toBe('node');
    });
  });

  describe('updateOptions', () => {
    test('should update options and call onOptionsUpdated', () => {
      const detector = new TestDetector();
      const newOptions: DetectionOptions = {
        scoreThreshold: 0.8,
        maxFaces: 3
      };
      
      detector.updateOptions(newOptions);
      
      expect(detector.getOptions()).toEqual(newOptions);
      expect(detector.onOptionsUpdatedCalled).toBe(true);
    });
    
    test('should not call onOptionsUpdated when no options change', () => {
      const initialOptions = { scoreThreshold: 0.5 };
      const detector = new TestDetector(initialOptions);
      
      // Reset flag after constructor
      detector.onOptionsUpdatedCalled = false;
      
      // Update with same options
      detector.updateOptions({ scoreThreshold: 0.5 });
      
      expect(detector.onOptionsUpdatedCalled).toBe(false);
    });
    
    test('should throw error if detector is disposed', () => {
      const detector = new TestDetector();
      
      // Dispose the detector
      detector.dispose();
      
      // Try to update options
      expect(() => {
        detector.updateOptions({ scoreThreshold: 0.8 });
      }).toThrow(FaceDetectionError);
    });
  });

  describe('dispose', () => {
    test('should call onDispose and set isDisposed flag', () => {
      const detector = new TestDetector();
      
      detector.dispose();
      
      expect(detector.onDisposeCalled).toBe(true);
      expect(detector.getIsDisposed()).toBe(true);
    });
    
    test('should not call onDispose when already disposed', () => {
      const detector = new TestDetector();
      
      detector.dispose();
      
      // Reset flag after first dispose
      detector.onDisposeCalled = false;
      
      // Dispose again
      detector.dispose();
      
      expect(detector.onDisposeCalled).toBe(false);
    });
  });

  describe('warmup', () => {
    test('should call onWarmup', async () => {
      const detector = new TestDetector();
      
      await detector.warmup();
      
      expect(detector.onWarmupCalled).toBe(true);
    });
    
    test('should throw error if detector is disposed', async () => {
      const detector = new TestDetector();
      
      // Dispose the detector
      detector.dispose();
      
      // Try to warmup
      await expect(detector.warmup()).rejects.toThrow(FaceDetectionError);
    });
  });

  describe('ensureTensorflowBackend', () => {
    test('should call initTensorflowBackend with correct environment', async () => {
      const detector = new TestDetector({ environment: 'node' });
      
      await detector.testEnsureTensorflowBackend();
      
      expect(initTensorflowBackend).toHaveBeenCalledWith('node');
    });
    
    test('should throw error if detector is disposed', async () => {
      const detector = new TestDetector();
      
      // Dispose the detector
      detector.dispose();
      
      // Try to ensure tensorflow backend
      await expect(detector.testEnsureTensorflowBackend()).rejects.toThrow(FaceDetectionError);
    });
    
    test('should throw FaceDetectionError if initTensorflowBackend fails', async () => {
      const detector = new TestDetector();
      
      // Mock initTensorflowBackend to reject
      (initTensorflowBackend as jest.Mock).mockRejectedValueOnce(new Error('Backend init failed'));
      
      // Try to ensure tensorflow backend
      await expect(detector.testEnsureTensorflowBackend()).rejects.toThrow(FaceDetectionError);
    });
  });
}); 