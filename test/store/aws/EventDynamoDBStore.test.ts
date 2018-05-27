// tslint:disable:no-unused-expression
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

import { EventStore } from "../../../src/store/EventStore";
import { EventDynamoDBStore } from "../../../src/store/aws/EventDynamoDBStore";
import { Event } from "../../../src/model/Event";
import { TestDataGenerator } from "../../util/TestDataGenerator";
import { AWSMock } from "../../mock/aws";

let eventStore: EventStore;

function eventDynamoDBStoreTest() {
  describe("EventDynamoDBStore", () => {
    before(() => {
      // setup chai
      chai.should();
      chai.use(chaiAsPromised);

      // enable AWS mock
      AWSMock.enableMock();

      // init journalStore after enabling AWS mock
      eventStore = new EventDynamoDBStore();
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

      eventStore
        .saveBatch(events)
        .then(() => {
          // get all events just stored for the aggregate
          return eventStore.getRange(aggregateId, startSequence, endSequence);
        })
        .then((events) => {
          // the number of events should match the events stored in step 1
          events.should.exist;
          events.should.be.length(sampleSize);

          return eventStore.getLast(aggregateId);
        })
        .then((event) => {
          // the last event should match, despite the order in which it was saved
          event.should.exist;
          event.should.eql(lastEvent);

          return eventStore.get(aggregateId, endSequence);
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

      eventStore
        .saveBatch(events)
        .then(() => {
          // +1 or it'll delete 21 items
          return eventStore.rollbackTo(aggregateId, endSequence - rollBackSize + 1);
        })
        .then(() => {
          return eventStore.getRange(aggregateId, startSequence, endSequence);
        })
        .then((events) => {
          // the number of events should match the events stored in step 1 minus those rolled back
          events.should.exist;
          events.should.be.length(sampleSize - rollBackSize);

          return eventStore.getLast(aggregateId);
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

      eventStore
        .saveBatch(events)
        .then(() => {
          return eventStore.rollforwardTo(aggregateId, startSequence + rollForwadSize);
        })
        .then(() => {
          return eventStore.getRange(aggregateId, startSequence, endSequence);
        })
        .then((events) => {
          // the number of events should match the events stored in step 1 minus those rolled forward
          events.should.exist;
          events.should.be.length(sampleSize - rollForwadSize - 1);

          return eventStore.getLast(aggregateId);
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

export default eventDynamoDBStoreTest;
