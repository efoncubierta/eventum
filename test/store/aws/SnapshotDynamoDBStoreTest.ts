// tslint:disable:no-unused-expression
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

import { SnapshotStore } from "../../../src/store/SnapshotStore";
import { SnapshotDynamoDBStore } from "../../../src/store/aws/SnapshotDynamoDBStore";
import { Snapshot } from "../../../src/model/Snapshot";
import { TestDataGenerator } from "../../util/TestDataGenerator";
import { AWSMock } from "../../mock/aws";

let snapshotStore: SnapshotStore;

function snapshotDynamoDBStoreTest() {
  describe("SnapshotDynamoDBStore", () => {
    before(() => {
      // setup chai
      chai.should();
      chai.use(chaiAsPromised);

      // enable AWS mock
      AWSMock.enableMock();

      // init journalStore after enabling AWS mock
      snapshotStore = new SnapshotDynamoDBStore();
    });

    after(() => {
      // restore AWS mock
      AWSMock.restoreMock();
    });

    it("should get the lastest snapshot when multiple snapshots exists", (done) => {
      const sampleSize = 100;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const snapshots = TestDataGenerator.randomSnapshots(sampleSize, aggregateId, startSequence);

      const promises = [];
      for (let i = 0; i < sampleSize; i++) {
        promises.push(snapshotStore.save(snapshots[i]));
      }

      Promise.all(promises)
        .then(() => {
          return snapshotStore.getLatest(aggregateId);
        })
        .then((latestSnapshot) => {
          latestSnapshot.should.exist;
          latestSnapshot.should.be.eql(snapshots[sampleSize - 1]);
        })
        .then(done)
        .catch(done);
    });

    it("should purge all snapshots as in CONFIG.snapshot.interval.count", (done) => {
      const sampleSize = 100;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const endSequence = startSequence + sampleSize - 1;
      const snapshots = TestDataGenerator.randomSnapshots(sampleSize, aggregateId, startSequence);

      const promises = [];
      for (let i = 0; i < sampleSize; i++) {
        promises.push(snapshotStore.save(snapshots[i]));
      }

      Promise.all(promises)
        .then(() => {
          return snapshotStore.purge(aggregateId);
        })
        .then(() => {
          return snapshotStore.getLatest(aggregateId);
        })
        .then((latestSnapshot) => {
          latestSnapshot.should.exist;
          latestSnapshot.should.be.eql(snapshots[sampleSize - 1]);
        })
        .then(done)
        .catch(done);
    });
  });
}

export default snapshotDynamoDBStoreTest;
