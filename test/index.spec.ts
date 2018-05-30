// tslint:disable:no-unused-expression
import "mocha";

import lambdaTests from "./lambda";
import serviceTests from "./service";
import storeTests from "./store";
import validationTests from "./validation";

describe("Eventum", () => {
  lambdaTests();
  serviceTests();
  storeTests();
  validationTests();
});
