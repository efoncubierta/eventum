// tslint:disable:no-unused-expression
import "mocha";

import apiTests from "./api.test";

function lambdaTests() {
  describe("Lambda Functions", () => {
    apiTests();
  });
}

export default lambdaTests;
