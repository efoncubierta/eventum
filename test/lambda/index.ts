// tslint:disable:no-unused-expression
import "mocha";
import apiTest from "./api";

function lambdaTest() {
  describe("Lambda Functions", () => {
    apiTest();
  });
}

export default lambdaTest;
