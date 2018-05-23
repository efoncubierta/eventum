// tslint:disable:no-unused-expression
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

import { JournalService } from "../../src/service/JournalService";
import { TestDataGenerator } from "../util/TestDataGenerator";
import { Eventum } from "../../src/Eventum";
import { AWSMock } from "../mock/aws";

function journalServiceTest() {
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

    it("should save a sequence of events", (done) => {
      // const retentionCount = Eventum.config().snapshot.retention.count;
      const sampleSize = 100;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const events = TestDataGenerator.randomEvents(sampleSize, aggregateId, startSequence);

      JournalService.saveEvents(events)
        .then(() => {
          return JournalService.getJournal(aggregateId);
        })
        .then((journal) => {
          journal.should.exist;
          journal.aggregateId.should.equals(aggregateId);
          journal.events.length.should.equals(events.length);
        })
        .then(done)
        .catch(done);
    });

    it("should take and snapshot and purge older ones", (done) => {
      // const retentionCount = Eventum.config().snapshot.retention.count;
      const sampleSize = 100;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const snapshotSequence = startSequence + sampleSize - 10;
      const events = TestDataGenerator.randomEvents(sampleSize, aggregateId, startSequence);
      const payload = TestDataGenerator.randomPayload();

      JournalService.saveEvents(events)
        .then(() => {
          return JournalService.createSnapshot(aggregateId, snapshotSequence, payload);
        })
        .then(() => {
          return JournalService.getJournal(aggregateId);
        })
        .then((journal) => {
          journal.should.exist;
          journal.aggregateId.should.equals(aggregateId);
          journal.snapshot.should.exist;
          journal.snapshot.aggregateId.should.equal(aggregateId);
          journal.snapshot.sequence.should.equal(snapshotSequence);
          journal.events.length.should.equals(9);
        })
        .then(done)
        .catch(done);
    });
  });
}

export default journalServiceTest;
