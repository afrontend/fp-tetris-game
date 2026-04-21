module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['./src/setupTests.js'],
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', {}],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(keyboard-handler)/)',
  ],
  moduleNameMapper: {
    '\\.(css|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
