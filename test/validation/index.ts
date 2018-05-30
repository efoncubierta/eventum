// tslint:disable:no-unused-expression
import "mocha";

import schemaTests from "./schema.test";

function validationTests() {
  describe("Validation", () => {
    schemaTests();
  });
}

export default validationTests;
