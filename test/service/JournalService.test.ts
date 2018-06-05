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
import { SnapshotKey } from "../../src/model/Snapshot";
import { EventKey } from "../../src/model/Event";

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

      return JournalService.getJournal(aggregateId).then((journalOpt) => {
        chai.should().exist(journalOpt);
        journalOpt.isNone().should.be.true;
      });
    });

    it("getEvent() should return null for a random EventKey", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();
      const sequence = TestDataGenerator.randomSequence();
      const eventKey: EventKey = {
        aggregateId,
        sequence
      };

      return JournalService.getEvent(eventKey).then((eventOpt) => {
        chai.should().exist(eventOpt);
        eventOpt.isNone().should.be.true;
      });
    });

    it("getSnapshot() should return null for a random aggregateId", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();
      const snapshotKey: SnapshotKey = {
        aggregateId,
        sequence: 0
      };

      return JournalService.getSnapshot(snapshotKey).then((snapshotOpt) => {
        chai.should().exist(snapshotOpt);
        snapshotOpt.isNone().should.be.true;
      });
    });

    it("saveSnapshot() should reject to save a snapshot from a random event", () => {
      const snapshotInput = TestDataGenerator.randomSnapshotInput();

      return JournalService.saveSnapshot(snapshotInput).should.be.rejected;
    });

    it("saveEvents() should save a sequence of correlated events, save snapshot from one of them and get a valid journal", () => {
      const sampleSize = 10;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const snapshotSequence = sampleSize - 5;
      const eventInputs = TestDataGenerator.randomEventInputArray(sampleSize, aggregateId);
      const snapshotInput = TestDataGenerator.randomSnapshotInput(aggregateId, snapshotSequence);
      const snapshotKey: SnapshotKey = {
        aggregateId,
        sequence: snapshotSequence
      };

      return JournalService.saveEvents(eventInputs)
        .then(() => {
          return JournalService.saveSnapshot(snapshotInput);
        })
        .then(() => {
          return JournalService.getSnapshot(snapshotKey);
        })
        .then((snapshotOpt) => {
          chai.should().exist(snapshotOpt);
          snapshotOpt.isSome().should.be.true;

          const s = snapshotOpt.getOrElse(null);
          s.aggregateId.should.equal(snapshotInput.aggregateId);
          s.sequence.should.equal(snapshotInput.sequence);
          s.payload.should.eql(snapshotInput.payload);

          return JournalService.getJournal(aggregateId);
        })
        .then((journalOpt) => {
          chai.should().exist(journalOpt);
          journalOpt.isSome().should.be.true;

          const j = journalOpt.getOrElse(null);
          j.aggregateId.should.equals(aggregateId);
          j.snapshot.should.exist;

          const s = j.snapshot;
          s.aggregateId.should.equal(aggregateId);
          s.sequence.should.equal(snapshotSequence);

          j.events.length.should.equals(5);
        });
    });

    it("saveEvents() should save a sequence of correlated not sorted events for different aggregates", () => {
      const sampleSize = 5;

      const aggregateIds = [TestDataGenerator.randomAggregateId(), TestDataGenerator.randomAggregateId()];

      // build dictionary of event inputs for validation
      let events = [];
      const eventsDic = aggregateIds.reduce((last, aggregateId) => {
        last[aggregateId] = TestDataGenerator.randomEventInputArray(sampleSize, aggregateId).reverse();
        events = events.concat(last[aggregateId]);
        return last;
      }, {});

      return JournalService.saveEvents(events).then(() => {
        const promises = aggregateIds.map((aggregateId) => {
          return JournalService.getJournal(aggregateId).then((journalOpt) => {
            chai.should().exist(journalOpt);
            journalOpt.isSome().should.be.true;

            const j = journalOpt.getOrElse(null);
            j.aggregateId.should.equals(aggregateId);
            j.events.length.should.equals(eventsDic[aggregateId].length);
          });
        });

        return Promise.all(promises);
      });
    });
  });
}

export default journalServiceTests;
