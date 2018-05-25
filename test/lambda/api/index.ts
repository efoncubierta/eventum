// tslint:disable:no-unused-expression
import "mocha";

import aggregatesAPITest from "./aggregates.test";

function apiTest() {
  describe("REST API", () => {
    aggregatesAPITest();
  });
}

export default apiTest;
