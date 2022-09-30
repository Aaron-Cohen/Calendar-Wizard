module.exports = {
  transform: {'^.+\\.ts?$': 'ts-jest'},
  testEnvironment: 'jsdom',
  testRegex: '/test/.*\\.(test)\\.(ts)$',
  moduleFileExtensions: ['js', 'ts', 'json', 'node'],
  setupFilesAfterEnv: ['jest-extended/all'],
  restoreMocks: true,
  clearMocks: true,
  resetMocks: true,
};
