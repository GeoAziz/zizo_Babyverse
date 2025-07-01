import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json']
};

export default config;