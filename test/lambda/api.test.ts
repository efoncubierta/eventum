// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// test dependencies
import { promisify } from "util";
import { TestDataGenerator } from "../util/TestDataGenerator";
import { AWSMock } from "../mock/aws";

// lambda functions
import { handler as getEventHandler } from "../../src/lambda/api/getEvent";
import { handler as getJournalHandler } from "../../src/lambda/api/getJournal";
import { handler as getSnapshotHandler } from "../../src/lambda/api/getSnapshot";
import { handler as saveSnapshotHandler } from "../../src/lambda/api/saveSnapshot";
import { handler as saveEventsHandler } from "../../src/lambda/api/saveEvents";

// promisify lambda functions
const getEventHandlerP = promisify(getEventHandler);
const getJournalHandlerP = promisify(getJournalHandler);
const getSnapshotHandlerP = promisify(getSnapshotHandler);
const saveSnapshotHandlerP = promisify(saveSnapshotHandler);
const saveEventsHandlerP = promisify(saveEventsHandler);

function apiTests() {
  describe("API", () => {
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

    it("getEvent() should respond 'BadRequest' for random requests", () => {
      const randomRequest = TestDataGenerator.randomPayload();

      return getEventHandlerP(randomRequest, null).then((response) => {
        response.should.exist;
        response.$type.should.exist;
        response.$type.should.equal("BadRequest");
      });
    });

    it("getEvent() should respond 'NotFound' for a random aggregate and sequence", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();
      const sequence = TestDataGenerator.randomSequence();
      const getEventRequest = TestDataGenerator.randomLambdaGetEventRequest(aggregateId, sequence);

      return getEventHandlerP(getEventRequest, null).then((response) => {
        response.should.exist;
        response.$type.should.exist;
        response.$type.should.equal("NotFound");
      });
    });

    it("getJournal() should respond 'BadRequest' for random requests", () => {
      const randomRequest = TestDataGenerator.randomPayload();

      return getJournalHandlerP(randomRequest, null).then((response) => {
        response.should.exist;
        response.$type.should.exist;
        response.$type.should.equal("BadRequest");
      });
    });

    it("getSnapshot() should respond 'BadRequest' for random requests", () => {
      const randomRequest = TestDataGenerator.randomPayload();

      return getSnapshotHandlerP(randomRequest, null).then((response) => {
        response.should.exist;
        response.$type.should.exist;
        response.$type.should.equal("BadRequest");
      });
    });

    it("saveSnapshot() should respond 'BadRequest' for random requests", () => {
      const randomRequest = TestDataGenerator.randomPayload();

      return saveSnapshotHandlerP(randomRequest, null).then((response) => {
        response.should.exist;
        response.$type.should.exist;
        response.$type.should.equal("BadRequest");
      });
    });

    it("saveEvents() should respond 'BadRequest' for random requests", () => {
      const randomRequest = TestDataGenerator.randomPayload();

      return saveEventsHandlerP(randomRequest, null).then((response) => {
        response.should.exist;
        response.$type.should.exist;
        response.$type.should.equal("BadRequest");
      });
    });

    it("getJournal() should respond 'NotFound' for a random aggregateId", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();
      const getJournalRequest = TestDataGenerator.randomLambdaGetJournalRequest(aggregateId);

      return getJournalHandlerP(getJournalRequest, null).then((response) => {
        response.should.exist;
        response.$type.should.exist;
        response.$type.should.equal("NotFound");
      });
    });

    it("getSnapshot() should respond 'NotFound' for a random aggregateId and sequence", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();
      const sequence = TestDataGenerator.randomSequence();
      const getSnapshotRequest = TestDataGenerator.randomLambdaGetSnapshotRequest(aggregateId, sequence);

      return getSnapshotHandlerP(getSnapshotRequest, null).then((response) => {
        response.should.exist;
        response.$type.should.exist;
        response.$type.should.equal("NotFound");
      });
    });

    it("saveEvents() should save a batch of events", () => {
      const sampleSize = 20;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = 1;
      const saveEventsRequest = TestDataGenerator.randomLambdaSaveEventsRequest(sampleSize, aggregateId, startSequence);
      const getEventRequest = TestDataGenerator.randomLambdaGetEventRequest(aggregateId, startSequence);
      const getJournalRequest = TestDataGenerator.randomLambdaGetJournalRequest(aggregateId);

      // get the deserialize events for validation
      const events = saveEventsRequest.events;

      return saveEventsHandlerP(saveEventsRequest, null)
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("Success");

          return getEventHandlerP(getEventRequest, null);
        })
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("Success");

          response.event.should.exist;
          response.event.should.eql(events[0]);

          return getJournalHandlerP(getJournalRequest, null);
        })
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("Success");

          response.journal.should.exist;
          response.journal.aggregateId.should.equals(aggregateId);
          response.journal.events.length.should.equals(events.length);
        });
    });

    it("saveSnapshot() should save a snapshot and get a valid journal", () => {
      // const retentionCount = Eventum.config().snapshot.retention.count;
      const sampleSize = 20;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = 1;
      const snapshotSequence = sampleSize - 10;
      const saveEventsRequest = TestDataGenerator.randomLambdaSaveEventsRequest(sampleSize, aggregateId, startSequence);
      const saveSnapshotRequest = TestDataGenerator.randomLambdaSaveSnapshotRequest(aggregateId, snapshotSequence);
      const getSnapshotRequest = TestDataGenerator.randomLambdaGetSnapshotRequest(aggregateId, snapshotSequence);
      const getJournalRequest = TestDataGenerator.randomLambdaGetJournalRequest(aggregateId);

      // deserialize input data for validation
      const events = saveEventsRequest.events;
      const payload = saveSnapshotRequest.payload;

      return saveEventsHandlerP(saveEventsRequest, null)
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("Success");

          return saveSnapshotHandlerP(saveSnapshotRequest, null);
        })
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("Success");

          return getSnapshotHandlerP(getSnapshotRequest, null);
        })
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("Success");

          response.snapshot.should.exist;
          response.snapshot.aggregateId.should.equal(aggregateId);
          response.snapshot.sequence.should.equal(snapshotSequence);
          response.snapshot.payload.should.eql(payload);

          return getJournalHandlerP(getJournalRequest, null);
        })
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("Success");

          response.journal.should.exist;
          response.journal.aggregateId.should.equals(aggregateId);
          response.journal.snapshot.should.exist;
          response.journal.snapshot.aggregateId.should.equal(aggregateId);
          response.journal.snapshot.sequence.should.equal(snapshotSequence);
          response.journal.events.length.should.equals(10);
        });
    });
  });
}

export default apiTests;
