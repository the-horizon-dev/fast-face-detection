export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.test.json'
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/*.test.ts'],
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      testPathIgnorePatterns: [
        '<rootDir>/tests/unit/core/',
        '<rootDir>/tests/unit/index.test.ts'
      ],
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          {
            useESM: true,
            tsconfig: 'tsconfig.test.json'
          },
        ],
      },
    },
    {
      displayName: 'unit-jsdom',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/tests/unit/core/**/*.test.ts',
        '<rootDir>/tests/unit/services/validation-service.test.ts',
        '<rootDir>/tests/unit/index.test.ts'
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          {
            useESM: true,
            tsconfig: 'tsconfig.test.json'
          },
        ],
      },
    },
    {
      displayName: 'integration',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          {
            useESM: true,
            tsconfig: 'tsconfig.test.json'
          },
        ],
      },
    },
  ],
}; 