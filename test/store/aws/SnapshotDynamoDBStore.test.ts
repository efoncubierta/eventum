// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// eventum dependencies
import { SnapshotStore } from "../../../src/store/SnapshotStore";
import { SnapshotDynamoDBStore } from "../../../src/store/aws/SnapshotDynamoDBStore";
import { Snapshot, SnapshotKey } from "../../../src/model/Snapshot";

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
      const snapshotKey: SnapshotKey = {
        aggregateId,
        sequence
      };

      return snapshotStore.get(snapshotKey).then((snapshotOpt) => {
        chai.should().exist(snapshotOpt);
        snapshotOpt.isNone().should.be.true;
      });
    });

    it("getLatest() should resolve to null for a random aggregateId", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();

      return snapshotStore.getLatest(aggregateId).then((snapshotOpt) => {
        chai.should().exist(snapshotOpt);
        snapshotOpt.isNone().should.be.true;
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
        .then((latestSnapshotOpt) => {
          latestSnapshotOpt.should.exist;
          latestSnapshotOpt.isSome().should.be.true;

          const s = latestSnapshotOpt.getOrElse(null);
          s.should.be.eql(snapshots[sampleSize - 1]);
        });
    });

    it("save() should save a snapshot", () => {
      const snapshot = TestDataGenerator.randomSnapshot();
      const snapshotKey: SnapshotKey = {
        aggregateId: snapshot.aggregateId,
        sequence: snapshot.sequence
      };

      return snapshotStore
        .save(snapshot)
        .then(() => {
          return snapshotStore.get(snapshotKey);
        })
        .then((savedSnapshotOpt) => {
          savedSnapshotOpt.should.exist;
          savedSnapshotOpt.isSome().should.be.true;

          const s = savedSnapshotOpt.getOrElse(null);
          s.should.be.eql(snapshot);
        });
    });

    it("purge() should delete all snapshots by the N last ones, defined in CONFIG.snapshot.interval.count", () => {
      const sampleSize = 10;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const endSequence = startSequence + sampleSize - 1;
      const snapshots = TestDataGenerator.randomSnapshots(sampleSize, aggregateId, startSequence);
      const latestSnapshotKey: SnapshotKey = {
        aggregateId,
        sequence: endSequence
      };

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
        .then((latestSnapshotOpt) => {
          latestSnapshotOpt.should.exist;
          latestSnapshotOpt.isSome().should.be.true;

          const s = latestSnapshotOpt.getOrElse(null);
          s.should.be.eql(snapshots[sampleSize - 1]);

          return snapshotStore.get(latestSnapshotKey);
        })
        .then((snapshotOpt) => {
          snapshotOpt.should.exist;
          snapshotOpt.isSome().should.be.true;

          const s = snapshotOpt.getOrElse(null);
          s.should.be.eql(snapshots[sampleSize - 1]);
        });
    });
  });
}

export default snapshotDynamoDBStoreTests;
