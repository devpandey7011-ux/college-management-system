
module.exports = {
  testEnvironment: "node",

  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          target: "es2022",
        },
        module: {
          type: "commonjs",
        },
      },
    ],
  },

  testMatch: ["**/tests/**/*.test.ts"],

  clearMocks: true,

  verbose: true,

  maxWorkers: 1,

  detectOpenHandles: true,

  testTimeout: 30000,
};
