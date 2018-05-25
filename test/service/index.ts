// tslint:disable:no-unused-expression
import "mocha";

import aggregateServiceTest from "./AggregateService.test";

function serviceTest() {
  describe("Services", () => {
    aggregateServiceTest();
  });
}

export default serviceTest;
