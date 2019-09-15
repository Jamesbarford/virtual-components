module.exports = {
  roots: ["."],
  transform: {
    "^.+\\.(tsx|ts)?$": "ts-jest"
  },
  globals: {
    "ts-jest": {
      tsConfig: "./tsconfig.json",
      isolatedModules: true,
      diagnostics: {
        pathRegex: ".*\\.jest.test\\.tsx?$",
        warnOnly: true
      }
    }
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec|unit))\\.(tsx|ts)?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
