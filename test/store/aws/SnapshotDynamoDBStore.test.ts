// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// eventum dependencies
import { SnapshotStore } from "../../../src/store/SnapshotStore";
import { SnapshotDynamoDBStore } from "../../../src/store/aws/SnapshotDynamoDBStore";
import { Snapshot } from "../../../src/model/Snapshot";

// test dependencies
import { TestDataGenerator } from "../../util/TestDataGenerator";
import { AWSMock } from "../../mock/aws";

let snapshotStore: SnapshotStore;

function snapshotDynamoDBStoreTests() {
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

    it("get() should resolve to null for a random aggregateId and sequence", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();
      const sequence = TestDataGenerator.randomSequence();

      return snapshotStore.get(aggregateId, sequence).then((snapshot) => {
        chai.should().not.exist(snapshot);
      });
    });

    it("getLatest() should resolve to null for a random aggregateId", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();

      return snapshotStore.getLatest(aggregateId).then((snapshot) => {
        chai.should().not.exist(snapshot);
      });
    });

    it("getLatest() should get the snapshot with the higher sequence when multiple snapshots exists", () => {
      const sampleSize = 10;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const snapshots = TestDataGenerator.randomSnapshots(sampleSize, aggregateId, startSequence);

      const promises = [];
      for (let i = 0; i < sampleSize; i++) {
        promises.push(snapshotStore.save(snapshots[i]));
      }

      return Promise.all(promises)
        .then(() => {
          return snapshotStore.getLatest(aggregateId);
        })
        .then((latestSnapshot) => {
          latestSnapshot.should.exist;
          latestSnapshot.should.be.eql(snapshots[sampleSize - 1]);
        });
    });

    it("save() should save a snapshot", () => {
      const snapshot = TestDataGenerator.randomSnapshot();

      return snapshotStore
        .save(snapshot)
        .then(() => {
          return snapshotStore.get(snapshot.aggregateId, snapshot.sequence);
        })
        .then((savedSnapshot) => {
          savedSnapshot.should.exist;
          savedSnapshot.should.be.eql(snapshot);
        });
    });

    it("purge() should delete all snapshots by the N last ones, defined in CONFIG.snapshot.interval.count", () => {
      const sampleSize = 10;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const endSequence = startSequence + sampleSize - 1;
      const snapshots = TestDataGenerator.randomSnapshots(sampleSize, aggregateId, startSequence);

      const promises = [];
      for (let i = 0; i < sampleSize; i++) {
        promises.push(snapshotStore.save(snapshots[i]));
      }

      return Promise.all(promises)
        .then(() => {
          return snapshotStore.purge(aggregateId);
        })
        .then(() => {
          return snapshotStore.getLatest(aggregateId);
        })
        .then((latestSnapshot) => {
          latestSnapshot.should.exist;
          latestSnapshot.should.be.eql(snapshots[sampleSize - 1]);

          return snapshotStore.get(aggregateId, endSequence);
        })
        .then((snapshot) => {
          snapshot.should.exist;
          snapshot.should.be.eql(snapshots[sampleSize - 1]);
        });
    });
  });
}

export default snapshotDynamoDBStoreTests;
