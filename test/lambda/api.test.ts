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

// lambda response types
import { ResponseType } from "../../src/lambda/ResponseType";
import { ErrorType } from "../../src/error/ErrorType";

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

      // @ts-ignore
      return getEventHandlerP(randomRequest, null).then((response) => {
        response.should.exist;
        response.type.should.exist;
        response.type.should.be.equal(ResponseType.ERROR);

        if (response.type === ResponseType.ERROR) {
          response.errorType.should.equal(ErrorType.BadRequest);
        }
      });
    });

    it("getEvent() should respond 'NotFound' for a random aggregate and sequence", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();
      const sequence = TestDataGenerator.randomSequence();
      const eventKey = TestDataGenerator.randomEventKey(aggregateId, sequence);

      // @ts-ignore
      return getEventHandlerP(eventKey, null).then((response) => {
        response.should.exist;
        response.type.should.exist;
        response.type.should.equal(ResponseType.ERROR);

        if (response.type === ResponseType.ERROR) {
          response.errorType.should.equal(ErrorType.NotFound);
        }
      });
    });

    it("getJournal() should respond 'BadRequest' for random requests", () => {
      const randomRequest = TestDataGenerator.randomPayload();

      // @ts-ignore
      return getJournalHandlerP(randomRequest, null).then((response) => {
        response.should.exist;
        response.type.should.exist;
        response.type.should.equal(ResponseType.ERROR);

        if (response.type === ResponseType.ERROR) {
          response.errorType.should.equal(ErrorType.BadRequest);
        }
      });
    });

    it("getSnapshot() should respond 'BadRequest' for random requests", () => {
      const randomRequest = TestDataGenerator.randomPayload();

      // @ts-ignore
      return getSnapshotHandlerP(randomRequest, null).then((response) => {
        response.should.exist;
        response.type.should.exist;
        response.type.should.equal(ResponseType.ERROR);

        if (response.type === ResponseType.ERROR) {
          response.errorType.should.equal(ErrorType.BadRequest);
        }
      });
    });

    it("saveSnapshot() should respond 'BadRequest' for random requests", () => {
      const randomRequest = TestDataGenerator.randomPayload();

      // @ts-ignore
      return saveSnapshotHandlerP(randomRequest, null).then((response) => {
        response.should.exist;
        response.type.should.exist;
        response.type.should.equal(ResponseType.ERROR);

        if (response.type === ResponseType.ERROR) {
          response.errorType.should.equal(ErrorType.BadRequest);
        }
      });
    });

    it("saveEvents() should respond 'BadRequest' for random requests", () => {
      const randomRequest = TestDataGenerator.randomPayload();

      // @ts-ignore
      return saveEventsHandlerP(randomRequest, null).then((response) => {
        response.should.exist;
        response.type.should.exist;
        response.type.should.equal(ResponseType.ERROR);

        if (response.type === ResponseType.ERROR) {
          response.errorType.should.equal(ErrorType.BadRequest);
        }
      });
    });

    it("getJournal() should respond 'NotFound' for a random aggregateId", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();
      const journalKey = TestDataGenerator.randomJournalKey(aggregateId);

      // @ts-ignore
      return getJournalHandlerP(journalKey, null).then((response) => {
        response.should.exist;
        response.type.should.exist;
        response.type.should.equal(ResponseType.ERROR);

        if (response.type === ResponseType.ERROR) {
          response.errorType.should.equal(ErrorType.NotFound);
        }
      });
    });

    it("getSnapshot() should respond 'NotFound' for a random aggregateId and sequence", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();
      const sequence = TestDataGenerator.randomSequence();
      const snapshotKey = TestDataGenerator.randomSnapshotKey(aggregateId, sequence);

      // @ts-ignore
      return getSnapshotHandlerP(snapshotKey, null).then((response) => {
        response.should.exist;
        response.type.should.exist;
        response.type.should.equal(ResponseType.ERROR);

        if (response.type === ResponseType.ERROR) {
          response.errorType.should.equal(ErrorType.NotFound);
        }
      });
    });

    it("saveEvents() should save a batch of events", () => {
      const sampleSize = 20;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const eventInputs = TestDataGenerator.randomEventInputArray(sampleSize, aggregateId);
      const eventKey = TestDataGenerator.randomEventKey(aggregateId, 1);
      const journalKey = TestDataGenerator.randomJournalKey(aggregateId);

      return (
        // @ts-ignore
        saveEventsHandlerP(eventInputs, null)
          // @ts-ignore
          .then((response) => {
            response.should.exist;
            response.type.should.exist;
            response.type.should.equal(ResponseType.OK);

            // @ts-ignore
            return getEventHandlerP(eventKey, null);
          })
          // @ts-ignore
          .then((response) => {
            response.should.exist;
            response.type.should.exist;
            response.type.should.equal(ResponseType.OK);

            if (response.type === ResponseType.OK) {
              const event = response.payload;
              event.should.exist;
              event.eventType.should.equal(eventInputs[0].eventType);
              event.aggregateId.should.equal(eventInputs[0].aggregateId);
              event.payload.should.eql(eventInputs[0].payload);
            }

            // @ts-ignore
            return getJournalHandlerP(journalKey, null);
          })
          // @ts-ignore
          .then((response) => {
            response.should.exist;
            response.type.should.exist;
            response.type.should.equal(ResponseType.OK);

            if (response.type === ResponseType.OK) {
              const journal = response.payload;
              journal.should.exist;
              journal.aggregateId.should.equals(aggregateId);
              journal.events.length.should.equals(eventInputs.length);
            }
          })
      );
    });

    it("saveSnapshot() should save a snapshot and get a valid journal", () => {
      // const retentionCount = Eventum.config().snapshot.retention.count;
      const sampleSize = 20;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const snapshotSequence = sampleSize - 10;
      const eventInputs = TestDataGenerator.randomEventInputArray(sampleSize, aggregateId);
      const snapshotInput = TestDataGenerator.randomSnapshotInput(aggregateId, snapshotSequence);
      const snapshotKey = TestDataGenerator.randomSnapshotKey(aggregateId, snapshotSequence);
      const journalKey = TestDataGenerator.randomJournalKey(aggregateId);

      // deserialize input data for validation
      const payload = snapshotInput.payload;

      return (
        // @ts-ignore
        saveEventsHandlerP(eventInputs, null)
          // @ts-ignore
          .then((response) => {
            response.should.exist;
            response.type.should.exist;
            response.type.should.equal(ResponseType.OK);

            // @ts-ignore
            return saveSnapshotHandlerP(snapshotInput, null);
          })
          // @ts-ignore
          .then((response) => {
            response.should.exist;
            response.type.should.exist;
            response.type.should.equal(ResponseType.OK);

            // @ts-ignore
            return getSnapshotHandlerP(snapshotKey, null);
          })
          // @ts-ignore
          .then((response) => {
            response.should.exist;
            response.type.should.exist;
            response.type.should.equal(ResponseType.OK);

            if (response.type === ResponseType.OK) {
              const snapshot = response.payload;
              snapshot.should.exist;
              snapshot.aggregateId.should.equal(aggregateId);
              snapshot.sequence.should.equal(snapshotSequence);
              snapshot.payload.should.eql(payload);
            }

            // @ts-ignore
            return getJournalHandlerP(journalKey, null);
          })
          // @ts-ignore
          .then((response) => {
            response.should.exist;
            response.type.should.exist;
            response.type.should.equal(ResponseType.OK);

            if (response.type === ResponseType.OK) {
              const journal = response.payload;
              journal.should.exist;
              journal.aggregateId.should.equals(aggregateId);

              journal.snapshot.should.exist;
              const snapshot = journal.snapshot;
              snapshot.aggregateId.should.equal(aggregateId);
              snapshot.sequence.should.equal(snapshotSequence);

              journal.events.length.should.equals(10);
            }
          })
      );
    });
  });
}

export default apiTests;
