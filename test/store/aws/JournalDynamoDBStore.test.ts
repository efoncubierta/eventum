// tslint:disable:no-unused-expression
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

import { JournalStore } from "../../../src/store/JournalStore";
import { JournalDynamoDBStore } from "../../../src/store/aws/JournalDynamoDBStore";
import { Event } from "../../../src/model/Event";
import { TestDataGenerator } from "../../util/TestDataGenerator";
import { AWSMock } from "../../mock/aws";

let journalStore: JournalStore;

function journalDynamoDBStoreTest() {
  describe("JournalDynamoDBStore", () => {
    before(() => {
      // setup chai
      chai.should();
      chai.use(chaiAsPromised);

      // enable AWS mock
      AWSMock.enableMock();

      // init journalStore after enabling AWS mock
      journalStore = new JournalDynamoDBStore();
    });

    after(() => {
      // restore AWS mock
      AWSMock.restoreMock();
    });

    it("should save a sequence of events", (done) => {
      const sampleSize = 50;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const endSequence = startSequence + sampleSize - 1;
      // reverse sequence of events to demonstrate order doesn't matter as long as there is a sequence id
      const events = TestDataGenerator.randomEvents(sampleSize, aggregateId, startSequence).reverse();
      const lastEvent = events[0]; // last one is the first one in reversed order

      journalStore
        .saveBatch(events)
        .then(() => {
          // get all events just stored for the aggregate
          return journalStore.getRange(aggregateId, startSequence, endSequence);
        })
        .then((events) => {
          // the number of events should match the events stored in step 1
          events.should.exist;
          events.should.be.length(sampleSize);

          return journalStore.getLast(aggregateId);
        })
        .then((event) => {
          // the last event should match, despite the order in which it was saved
          event.should.exist;
          event.should.eql(lastEvent);

          return journalStore.get(aggregateId, endSequence);
        })
        .then((event) => {
          event.should.exist;
          event.should.eql(lastEvent);
        })
        .then(done)
        .catch(done);
    });

    it("should roll-back all events newer than a sequence number", (done) => {
      const sampleSize = 50;
      const rollBackSize = 20;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const endSequence = startSequence + sampleSize - 1;
      // reverse sequence of events to demonstrate order doesn't matter as long as there is a sequence id
      const events = TestDataGenerator.randomEvents(sampleSize, aggregateId, startSequence).reverse();
      const lastEvent = events[rollBackSize]; // last one will be in rollBackSize position after roll-back is performed

      journalStore
        .saveBatch(events)
        .then(() => {
          // +1 or it'll delete 21 items
          return journalStore.rollbackTo(aggregateId, endSequence - rollBackSize + 1);
        })
        .then(() => {
          return journalStore.getRange(aggregateId, startSequence, endSequence);
        })
        .then((events) => {
          // the number of events should match the events stored in step 1 minus those rolled back
          events.should.exist;
          events.should.be.length(sampleSize - rollBackSize);

          return journalStore.getLast(aggregateId);
        })
        .then((event) => {
          // the last event should match, despite the order in which it was saved
          event.should.exist;
          event.should.eql(lastEvent);
        })
        .then(done)
        .catch(done);
    });

    it("should roll-forward all events older than a sequence number", (done) => {
      const sampleSize = 50;
      const rollForwadSize = 20;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const endSequence = startSequence + sampleSize - 1;
      // reverse sequence of events to demonstrate order doesn't matter as long as there is a sequence id
      const events = TestDataGenerator.randomEvents(sampleSize, aggregateId, startSequence).reverse();
      const lastEvent = events[0]; // last one is the first one in reversed order

      journalStore
        .saveBatch(events)
        .then(() => {
          return journalStore.rollforwardTo(aggregateId, startSequence + rollForwadSize);
        })
        .then(() => {
          return journalStore.getRange(aggregateId, startSequence, endSequence);
        })
        .then((events) => {
          // the number of events should match the events stored in step 1 minus those rolled forward
          events.should.exist;
          events.should.be.length(sampleSize - rollForwadSize - 1);

          return journalStore.getLast(aggregateId);
        })
        .then((event) => {
          // the last event should match, despite the order in which it was saved
          event.should.exist;
          event.should.eql(lastEvent);
        })
        .then(done)
        .catch(done);
    });
  });
}

export default journalDynamoDBStoreTest;
