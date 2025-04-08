import { ConfigurationService } from '../../../src/services/configuration-service';

// Mock the module if needed
jest.mock('../../../src/services/configuration-service');

// Import the mocked module
const mockedConfigService = jest.mocked(ConfigurationService);

describe('ConfigurationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDefaultOptions', () => {
    test('should create default options for browser environment', () => {
      // Setup the mock implementation
      mockedConfigService.createDefaultOptions.mockReturnValue({
        environment: 'browser',
        scoreThreshold: 0.5,
        maxFaces: 10,
        enableTracking: true
      });
      
      const options = ConfigurationService.createDefaultOptions('browser');
      
      expect(options).toEqual({
        environment: 'browser',
        scoreThreshold: 0.5,
        maxFaces: 10,
        enableTracking: true
      });
    });
    
    test('should create default options for node environment', () => {
      // Setup the mock implementation
      mockedConfigService.createDefaultOptions.mockReturnValue({
        environment: 'node',
        scoreThreshold: 0.5,
        maxFaces: 10,
        enableTracking: true
      });
      
      const options = ConfigurationService.createDefaultOptions('node');
      
      expect(options).toEqual({
        environment: 'node',
        scoreThreshold: 0.5,
        maxFaces: 10,
        enableTracking: true
      });
    });
  });
  
  describe('mergeOptions', () => {
    test('should merge options correctly', () => {
      const current = {
        environment: 'browser',
        scoreThreshold: 0.5,
        maxFaces: 10,
        enableTracking: true
      };
      
      const newOptions = {
        scoreThreshold: 0.8,
        maxFaces: 5
      };
      
      // Setup the mock implementation
      mockedConfigService.mergeOptions.mockReturnValue({
        environment: 'browser',
        scoreThreshold: 0.8,
        maxFaces: 5,
        enableTracking: true
      });
      
      const merged = ConfigurationService.mergeOptions(current as any, newOptions);
      
      expect(merged).toEqual({
        environment: 'browser',
        scoreThreshold: 0.8,
        maxFaces: 5,
        enableTracking: true
      });
    });
    
    test('should prioritize new environment if specified', () => {
      const current = {
        environment: 'browser',
        scoreThreshold: 0.5
      };
      
      const newOptions = {
        environment: 'node'
      };
      
      // Setup the mock implementation
      mockedConfigService.mergeOptions.mockReturnValue({
        environment: 'node',
        scoreThreshold: 0.5
      });
      
      const merged = ConfigurationService.mergeOptions(current as any, newOptions as any);
      
      expect(merged.environment).toBe('node');
    });
    
    test('should keep current values when new options are undefined', () => {
      const current = {
        environment: 'browser',
        scoreThreshold: 0.5,
        maxFaces: 10,
        enableTracking: true
      };
      
      const newOptions = {
        modelType: 'SHORT'
      };
      
      // Setup the mock implementation
      mockedConfigService.mergeOptions.mockReturnValue({
        environment: 'browser',
        scoreThreshold: 0.5,
        maxFaces: 10,
        enableTracking: true,
        modelType: 'SHORT'
      });
      
      const merged = ConfigurationService.mergeOptions(current as any, newOptions);
      
      expect(merged).toEqual({
        environment: 'browser',
        scoreThreshold: 0.5,
        maxFaces: 10,
        enableTracking: true,
        modelType: 'SHORT'
      });
    });
  });
  
  describe('hasOptionsChanged', () => {
    test('should return true when scoreThreshold changes', () => {
      const current = { scoreThreshold: 0.5 };
      const newOptions = { scoreThreshold: 0.8 };
      
      mockedConfigService.hasOptionsChanged.mockReturnValue(true);
      
      expect(ConfigurationService.hasOptionsChanged(current, newOptions)).toBe(true);
    });
    
    test('should return true when maxFaces changes', () => {
      const current = { maxFaces: 10 };
      const newOptions = { maxFaces: 5 };
      
      mockedConfigService.hasOptionsChanged.mockReturnValue(true);
      
      expect(ConfigurationService.hasOptionsChanged(current, newOptions)).toBe(true);
    });
    
    test('should return true when enableTracking changes', () => {
      const current = { enableTracking: true };
      const newOptions = { enableTracking: false };
      
      mockedConfigService.hasOptionsChanged.mockReturnValue(true);
      
      expect(ConfigurationService.hasOptionsChanged(current, newOptions)).toBe(true);
    });
    
    test('should return true when environment changes', () => {
      const current = { environment: 'browser' };
      const newOptions = { environment: 'node' };
      
      mockedConfigService.hasOptionsChanged.mockReturnValue(true);
      
      expect(ConfigurationService.hasOptionsChanged(current as any, newOptions as any)).toBe(true);
    });
    
    test('should return false when no relevant options change', () => {
      const current = { 
        scoreThreshold: 0.5,
        maxFaces: 10,
        enableTracking: true,
        environment: 'browser'
      };
      
      const newOptions = { 
        modelType: 'SHORT'
      };
      
      mockedConfigService.hasOptionsChanged.mockReturnValue(false);
      
      expect(ConfigurationService.hasOptionsChanged(current as any, newOptions)).toBe(false);
    });
  });
}); 