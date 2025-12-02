module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.cjs'],
  moduleNameMapper: {
    '\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\.(js|jsx)$': 'babel-jest',
  },
};