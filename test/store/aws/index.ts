// tslint:disable:no-unused-expression
import "mocha";

import eventDynamoDBStoreTests from "./EventDynamoDBStore.test";
import snapshotDynamoDBStoreTests from "./SnapshotDynamoDBStore.test";

function awsStoreTest() {
  describe("Provider :: AWS", () => {
    eventDynamoDBStoreTests();
    snapshotDynamoDBStoreTests();
  });
}

export default awsStoreTest;
