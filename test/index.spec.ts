// tslint:disable:no-unused-expression
import "mocha";

import lambdaTest from "./lambda";
import serviceTest from "./service";
import storeTest from "./store";

describe("Eventum", () => {
  lambdaTest();
  serviceTest();
  storeTest();
});
