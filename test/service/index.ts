// tslint:disable:no-unused-expression
import "mocha";

import journalServiceTests from "./JournalService.test";

function serviceTest() {
  describe("Services", () => {
    journalServiceTests();
  });
}

export default serviceTest;
