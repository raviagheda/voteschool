/**
 * @fileoverview Jest configuration for VoteSchool.
 */

module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'server/tsconfig.json' }],
  },
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.test.ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'server/**/*.ts',
    '!server/index.ts',
  ],
};
