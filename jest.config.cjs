/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  // Let ts-jest know we are using ESM style modules
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.app.json',
        useESM: true,
        diagnostics: true,
        isolatedModules: true
      }
    ]
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts','tsx','js','jsx','json'],
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$'
};