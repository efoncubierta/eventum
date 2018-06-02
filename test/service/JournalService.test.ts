// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// test dependencies
import { TestDataGenerator } from "../util/TestDataGenerator";
import { AWSMock } from "../mock/aws";

// eventum dependencies
import { JournalService } from "../../src/service/JournalService";

function journalServiceTests() {
  describe("JournalService", () => {
    before(() => {
      // setup chai
      chai.should();
      chai.use(chaiAsPromised);

      // enable AWS mock
      AWSMock.enableMock();
    });

    after(() => {
      // restore AWS mock
      AWSMock.restoreMock();
    });

    it("getJournal() should return null for a random aggregateId", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();

      return JournalService.getJournal(aggregateId).then((journal) => {
        chai.should().not.exist(journal);
      });
    });

    it("getEvent() should return null for a random aggregateId", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();

      return JournalService.getEvent(aggregateId, 0).then((event) => {
        chai.should().not.exist(event);
      });
    });

    it("getSnapshot() should return null for a random aggregateId", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();

      return JournalService.getSnapshot(aggregateId, 0).then((snapshot) => {
        chai.should().not.exist(snapshot);
      });
    });

    it("saveSnapshot() should reject to save a snapshot from a random event", () => {
      const snapshotInput = TestDataGenerator.randomSnapshotInput();

      return JournalService.saveSnapshot(snapshotInput).should.be.rejected;
    });

    it("saveEvents() should save a sequence of correlated events, save snapshot from one of them and get a valid journal", () => {
      const sampleSize = 20;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const snapshotSequence = sampleSize - 10;
      const eventInputs = TestDataGenerator.randomEventInputArray(sampleSize, aggregateId);
      const snapshotInput = TestDataGenerator.randomSnapshotInput(aggregateId, snapshotSequence);

      return JournalService.saveEvents(eventInputs)
        .then(() => {
          return JournalService.saveSnapshot(snapshotInput);
        })
        .then(() => {
          return JournalService.getSnapshot(aggregateId, snapshotSequence);
        })
        .then((snapshot) => {
          chai.should().exist(snapshot);
          snapshot.aggregateId.should.equal(snapshotInput.aggregateId);
          snapshot.sequence.should.equal(snapshotInput.sequence);
          snapshot.payload.should.eql(snapshotInput.payload);

          return JournalService.getJournal(aggregateId);
        })
        .then((journal) => {
          chai.should().exist(journal);
          journal.aggregateId.should.equals(aggregateId);
          journal.snapshot.should.exist;
          journal.snapshot.aggregateId.should.equal(aggregateId);
          journal.snapshot.sequence.should.equal(snapshotSequence);
          journal.events.length.should.equals(10);
        });
    });

    it("saveEvents() should save a sequence of correlated not sorted events for different aggregates", () => {
      const sampleSize = 10;

      const aggregateIds = [
        TestDataGenerator.randomAggregateId(),
        TestDataGenerator.randomAggregateId(),
        TestDataGenerator.randomAggregateId()
      ];

      // build dictionary of event inputs for validation
      let events = [];
      const eventsDic = aggregateIds.reduce((last, aggregateId) => {
        last[aggregateId] = TestDataGenerator.randomEventInputArray(sampleSize, aggregateId).reverse();
        events = events.concat(last[aggregateId]);
        return last;
      }, {});

      return JournalService.saveEvents(events).then(() => {
        const promises = aggregateIds.map((aggregateId) => {
          return JournalService.getJournal(aggregateId).then((journal) => {
            chai.should().exist(journal);
            journal.aggregateId.should.equals(aggregateId);
            journal.events.length.should.equals(eventsDic[aggregateId].length);
          });
        });

        return Promise.all(promises);
      });
    });
  });
}

export default journalServiceTests;
