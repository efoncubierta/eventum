// tslint:disable:no-unused-expression
import "mocha";

import journalDynamoDBStoreTest from "./JournalDynamoDBStore.test";
import snapshotDynamoDBStoreTest from "./SnapshotDynamoDBStore.test";

function awsStoreTest() {
  describe("Provider :: AWS", () => {
    journalDynamoDBStoreTest();
    snapshotDynamoDBStoreTest();
  });
}

export default awsStoreTest;
