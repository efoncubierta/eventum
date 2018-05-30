// tslint:disable:no-unused-expression
import "mocha";

import awsStoreTests from "./aws";

function storeTests() {
  describe("Stores", () => {
    awsStoreTests();
  });
}

export default storeTests;
