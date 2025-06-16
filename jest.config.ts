import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^../lib/supabaseClient$': '<rootDir>/__mocks__/supabaseClient.ts'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@supabase/supabase-js|@supabase/realtime-js).+\\.js$'
  ]
};

export default config;
