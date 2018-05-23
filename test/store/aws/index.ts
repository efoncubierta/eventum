// tslint:disable:no-unused-expression
import "mocha";

import journalDynamoDBStoreTest from "./JournalDynamoDBStoreTest";
import snapshotDynamoDBStoreTest from "./SnapshotDynamoDBStoreTest";

function awsStoreTest() {
  describe("Provider :: AWS", () => {
    journalDynamoDBStoreTest();
    snapshotDynamoDBStoreTest();
  });
}

export default awsStoreTest;
