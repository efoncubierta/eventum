// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// eventum dependencies
import { EventStore } from "../../../src/store/EventStore";
import { EventDynamoDBStore } from "../../../src/store/aws/EventDynamoDBStore";
import { Event, EventKey } from "../../../src/model/Event";

// test dependencies
import { TestDataGenerator } from "../../util/TestDataGenerator";
import { AWSMock } from "../../mock/aws";

let eventStore: EventStore;

function eventDynamoDBStoreTests() {
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

    it("save()/remove() should save and remove an event by its EventKey", () => {
      const event = TestDataGenerator.randomEvent();
      const eventKey: EventKey = {
        aggregateId: event.aggregateId,
        sequence: event.sequence
      };

      return eventStore
        .save(event)
        .then(() => {
          return eventStore.get(eventKey);
        })
        .then((eventOpt) => {
          eventOpt.should.exist;
          eventOpt.isSome().should.be.true;

          const e = eventOpt.getOrElse(null);
          e.should.eql(event);

          return eventStore.remove(eventKey);
        })
        .then(() => {
          return eventStore.get(eventKey);
        })
        .then((eventOpt) => {
          eventOpt.should.exist;
          eventOpt.isNone().should.be.true;
        });
    });

    it("save()/removeById() should save and remove an event by its EventId", () => {
      const event = TestDataGenerator.randomEvent();

      return eventStore
        .save(event)
        .then(() => {
          return eventStore.getById(event.eventId);
        })
        .then((eventOpt) => {
          eventOpt.should.exist;
          eventOpt.isSome().should.be.true;

          const e = eventOpt.getOrElse(null);
          e.should.eql(event);

          return eventStore.removeById(event.eventId);
        })
        .then(() => {
          return eventStore.getById(event.eventId);
        })
        .then((eventOpt) => {
          eventOpt.should.exist;
          eventOpt.isNone().should.be.true;
        });
    });

    it("saveBatch() should resolve to empty object {} if events is undefined or empty list", () => {
      return eventStore
        .saveBatch(undefined)
        .then((response) => {
          chai.should().exist(response);
          chai.should().not.exist(response.failedItems);

          return eventStore.saveBatch([]);
        })
        .then((response) => {
          chai.should().exist(response);
          chai.should().not.exist(response.failedItems);
        });
    });

    it("saveBatch() should save a sequence of random events", () => {
      const sampleSize = 10;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const endSequence = startSequence + sampleSize - 1;
      // reverse sequence of events to demonstrate order doesn't matter as long as there is a sequence id
      const events = TestDataGenerator.randomEventArray(sampleSize, aggregateId, startSequence).reverse();
      const lastEvent = events[0]; // last one is the first one in reversed order
      const lastEventKey: EventKey = {
        aggregateId,
        sequence: endSequence
      };

      return eventStore
        .saveBatch(events)
        .then(() => {
          // get all events just stored for the aggregate
          return eventStore.getRange(aggregateId, startSequence, endSequence);
        })
        .then((es) => {
          // the number of events should match the events stored in step 1
          es.should.exist;
          es.should.be.length(sampleSize);

          return eventStore.getLast(aggregateId);
        })
        .then((eventOpt) => {
          // the last event should match, despite the order in which it was saved
          eventOpt.should.exist;
          eventOpt.isSome().should.be.true;

          const e = eventOpt.getOrElse(null);
          e.should.eql(lastEvent);

          return eventStore.get(lastEventKey);
        })
        .then((eventOpt) => {
          eventOpt.should.exist;
          eventOpt.isSome().should.be.true;

          const e = eventOpt.getOrElse(null);
          e.should.eql(lastEvent);
        });
    });

    it("saveBatch()/retryBatchWrite() should be rejected after 4 attempts", () => {
      // the mock only handle 10 items per request and the retryBatchWrite is configured to attempt up to 4 times
      const sampleSize = 41;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const events = TestDataGenerator.randomEventArray(sampleSize, aggregateId);

      return eventStore.saveBatch(events).should.be.rejected;
    });

    it("removeBatch() should resolve to empty object {} if events is undefined or empty list", () => {
      return eventStore
        .removeBatch(undefined)
        .then((response) => {
          chai.should().exist(response);
          chai.should().not.exist(response.failedItems);

          return eventStore.removeBatch([]);
        })
        .then((response) => {
          chai.should().exist(response);
          chai.should().not.exist(response.failedItems);
        });
    });

    it("removeBatch() should delete a sequence of random events", () => {
      const sampleSize = 10;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const endSequence = startSequence + sampleSize - 1;
      // reverse sequence of events to demonstrate order doesn't matter as long as there is a sequence id
      const events = TestDataGenerator.randomEventArray(sampleSize, aggregateId, startSequence).reverse();
      const lastEvent = events[0]; // last one is the first one in reversed order

      return eventStore
        .saveBatch(events)
        .then(() => {
          // get all events just stored for the aggregate
          return eventStore.getRange(aggregateId, startSequence, endSequence);
        })
        .then((es) => {
          // the number of events should match the events stored in step 1
          es.should.exist;
          es.should.be.length(sampleSize);

          return eventStore.removeBatch(events);
        })
        .then(() => {
          // attempt to get all events just removed for the aggregate
          return eventStore.getRange(aggregateId, startSequence, endSequence);
        })
        .then((es) => {
          // the number of events should be 0 after removing the batch
          es.should.exist;
          es.should.be.length(0);
        });
    });

    it("rollBackTo() should delete all events newer than a sequence number", () => {
      const sampleSize = 10;
      const rollBackSize = 5;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = 1;
      const endSequence = sampleSize;
      // reverse sequence of events to demonstrate order doesn't matter as long as there is a sequence id
      const events = TestDataGenerator.randomEventArray(sampleSize, aggregateId, startSequence).reverse();
      const lastEvent = events[rollBackSize]; // last one will be in rollBackSize position after roll-back is performed
      const rollbackEventKey: EventKey = {
        aggregateId,
        sequence: endSequence - rollBackSize + 1
      };

      return eventStore
        .saveBatch(events)
        .then(() => {
          // +1 or it'll delete 21 items
          return eventStore.rollbackTo(rollbackEventKey);
        })
        .then(() => {
          return eventStore.getRange(aggregateId, startSequence, endSequence);
        })
        .then((es) => {
          // the number of events should match the events stored in step 1 minus those rolled back
          es.should.exist;
          es.should.be.length(sampleSize - rollBackSize);

          return eventStore.getLast(aggregateId);
        })
        .then((eventOpt) => {
          // the last event should match, despite the order in which it was saved
          eventOpt.should.exist;
          eventOpt.isSome().should.be.true;

          const e = eventOpt.getOrElse(null);
          e.should.eql(lastEvent);
        });
    });

    it("rollForward() should delete all events older than a sequence number", () => {
      const sampleSize = 10;
      const rollForwadSize = 5;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const endSequence = startSequence + sampleSize - 1;
      // reverse sequence of events to demonstrate order doesn't matter as long as there is a sequence id
      const events = TestDataGenerator.randomEventArray(sampleSize, aggregateId, startSequence).reverse();
      const lastEvent = events[0]; // last one is the first one in reversed order
      const rollfowardEventKey: EventKey = {
        aggregateId,
        sequence: startSequence + rollForwadSize
      };

      return eventStore
        .saveBatch(events)
        .then(() => {
          return eventStore.rollforwardTo(rollfowardEventKey);
        })
        .then(() => {
          return eventStore.getRange(aggregateId, startSequence, endSequence);
        })
        .then((es) => {
          // the number of events should match the events stored in step 1 minus those rolled forward
          es.should.exist;
          es.should.be.length(sampleSize - rollForwadSize - 1);

          return eventStore.getLast(aggregateId);
        })
        .then((eventOpt) => {
          // the last event should match, despite the order in which it was saved
          eventOpt.should.exist;
          eventOpt.isSome().should.be.true;

          const e = eventOpt.getOrElse(null);
          e.should.eql(lastEvent);
        });
    });

    it("get() should resolve to None for a random EventKey", () => {
      const eventKey = TestDataGenerator.randomEventKey();

      return eventStore.get(eventKey).then((eventOpt) => {
        chai.should().exist(eventOpt);
        eventOpt.isNone().should.be.true;
      });
    });

    it("getById() should resolve to None for a random EventId", () => {
      const eventId = TestDataGenerator.randomEventId();

      return eventStore.getById(eventId).then((eventOpt) => {
        chai.should().exist(eventOpt);
        eventOpt.isNone().should.be.true;
      });
    });

    it("getLast() should resolve to None for a random aggregateId", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();

      return eventStore.getLast(aggregateId).then((eventOpt) => {
        chai.should().exist(eventOpt);
        eventOpt.isNone().should.be.true;
      });
    });

    it("getRange() should resolve to empty list a random aggregateId and sequences", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const endSequence = TestDataGenerator.randomSequence();

      return eventStore.getRange(aggregateId, startSequence, endSequence).then((events) => {
        chai.should().exist(events);
        events.should.be.length(0);
      });
    });
  });
}

export default eventDynamoDBStoreTests;
