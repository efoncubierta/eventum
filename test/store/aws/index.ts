// tslint:disable:no-unused-expression
import "mocha";

import eventDynamoDBStoreTest from "./EventDynamoDBStore.test";
import snapshotDynamoDBStoreTest from "./SnapshotDynamoDBStore.test";

function awsStoreTest() {
  describe("Provider :: AWS", () => {
    eventDynamoDBStoreTest();
    snapshotDynamoDBStoreTest();
  });
}

export default awsStoreTest;
