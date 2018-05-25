// tslint:disable:no-unused-expression
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

import { AggregateService } from "../../src/service/AggregateService";
import { TestDataGenerator } from "../util/TestDataGenerator";
import { AWSMock } from "../mock/aws";

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

    it("should save a sequence of events", (done) => {
      // const retentionCount = Eventum.config().snapshot.retention.count;
      const sampleSize = 100;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const events = TestDataGenerator.randomEvents(sampleSize, aggregateId, startSequence);

      AggregateService.saveEvents(events)
        .then(() => {
          return AggregateService.getEvent(aggregateId, startSequence);
        })
        .then((event) => {
          event.should.exist;
          event.should.eql(events[0]);

          return AggregateService.getJournal(aggregateId);
        })
        .then((journal) => {
          journal.should.exist;
          journal.aggregateId.should.equals(aggregateId);
          journal.events.length.should.equals(events.length);
        })
        .then(done)
        .catch(done);
    });

    it("should take a snapshot and get a valid journal", (done) => {
      // const retentionCount = Eventum.config().snapshot.retention.count;
      const sampleSize = 100;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const snapshotSequence = startSequence + sampleSize - 10;
      const events = TestDataGenerator.randomEvents(sampleSize, aggregateId, startSequence);
      const payload = TestDataGenerator.randomPayload();

      AggregateService.saveEvents(events)
        .then(() => {
          return AggregateService.saveSnapshot(aggregateId, snapshotSequence, payload);
        })
        .then(() => {
          return AggregateService.getSnapshot(aggregateId, snapshotSequence);
        })
        .then((snapshot) => {
          snapshot.should.exist;
          snapshot.aggregateId.should.equal(aggregateId);
          snapshot.sequence.should.equal(snapshotSequence);
          snapshot.payload.should.eql(payload);

          return AggregateService.getJournal(aggregateId);
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

export default aggregateServiceTest;
