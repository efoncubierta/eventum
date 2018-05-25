// tslint:disable:no-unused-expression
import "mocha";

import awsStoreTest from "./aws";

function storeTest() {
  describe("Stores", () => {
    awsStoreTest();
  });
}

export default storeTest;
