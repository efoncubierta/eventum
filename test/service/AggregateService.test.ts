// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// test dependencies
import { TestDataGenerator } from "../util/TestDataGenerator";
import { AWSMock } from "../mock/aws";

// eventum dependencies
import { AggregateService } from "../../src/service/AggregateService";

function aggregateServiceTest() {
  describe("AggregateService", () => {
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

      return AggregateService.getJournal(aggregateId).then((journal) => {
        chai.should().not.exist(journal);
      });
    });

    it("getEvent() should return null for a random aggregateId", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();

      return AggregateService.getEvent(aggregateId, 0).then((event) => {
        chai.should().not.exist(event);
      });
    });

    it("getSnapshot() should return null for a random aggregateId", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();

      return AggregateService.getSnapshot(aggregateId, 0).then((snapshot) => {
        chai.should().not.exist(snapshot);
      });
    });

    it("saveSnapshot() should reject to save a snapshot from a random event", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();
      const sequence = TestDataGenerator.randomSequence();
      const payload = TestDataGenerator.randomPayload();

      return AggregateService.saveSnapshot(aggregateId, sequence, payload).should.be.rejected;
    });

    it("saveEvents() should reject undefined list of events", () => {
      return AggregateService.saveEvents(undefined).should.be.rejected;
    });

    it("saveEvents() should reject to save events that are not correlated", () => {
      const sampleSize = 20;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = 10; // first event should have sequence 1
      const events = TestDataGenerator.randomEvents(sampleSize, aggregateId, startSequence);

      return AggregateService.saveEvents(events).should.be.rejected;
    });

    it("saveEvents() should save a sequence of correlated events, save snapshot from one of them and get a valid journal", () => {
      const sampleSize = 20;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = 1;
      const snapshotSequence = sampleSize - 10;
      const events = TestDataGenerator.randomEvents(sampleSize, aggregateId, startSequence);
      const payload = TestDataGenerator.randomPayload();

      return AggregateService.saveEvents(events)
        .then(() => {
          return AggregateService.saveSnapshot(aggregateId, snapshotSequence, payload);
        })
        .then(() => {
          return AggregateService.getSnapshot(aggregateId, snapshotSequence);
        })
        .then((snapshot) => {
          chai.should().exist(snapshot);
          snapshot.aggregateId.should.equal(aggregateId);
          snapshot.sequence.should.equal(snapshotSequence);
          snapshot.payload.should.eql(payload);

          return AggregateService.getJournal(aggregateId);
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
      const startSequence = 1;

      const aggregateIds = [
        TestDataGenerator.randomAggregateId(),
        TestDataGenerator.randomAggregateId(),
        TestDataGenerator.randomAggregateId()
      ];

      // build dictionary of events for validation
      let events = [];
      const eventsDic = aggregateIds.reduce((last, aggregateId) => {
        last[aggregateId] = TestDataGenerator.randomEvents(sampleSize, aggregateId, startSequence).reverse();
        events = events.concat(last[aggregateId]);
        return last;
      }, {});

      return AggregateService.saveEvents(events).then(() => {
        const promises = aggregateIds.map((aggregateId) => {
          return AggregateService.getJournal(aggregateId).then((journal) => {
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

export default aggregateServiceTest;
