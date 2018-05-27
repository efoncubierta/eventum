// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// test dependencies
import { promisify } from "util";
import { TestDataGenerator } from "../../util/TestDataGenerator";
import { AWSMock } from "../../mock/aws";

// lambda functions
import { handler as getEventHandler } from "../../../src/lambda/api/getEvent";
import { handler as getJournalHandler } from "../../../src/lambda/api/getJournal";
import { handler as getSnapshotHandler } from "../../../src/lambda/api/getSnapshot";
import { handler as saveSnapshotHandler } from "../../../src/lambda/api/saveSnapshot";
import { handler as saveEventsHandler } from "../../../src/lambda/api/saveEvents";

// promisify lambda functions
const getEventHandlerP = promisify(getEventHandler);
const getJournalHandlerP = promisify(getJournalHandler);
const getSnapshotHandlerP = promisify(getSnapshotHandler);
const saveSnapshotHandlerP = promisify(saveSnapshotHandler);
const saveEventsHandlerP = promisify(saveEventsHandler);

function aggregatesAPITest() {
  describe("api/*", () => {
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

    it("should respond 'BadRequest' for random requests", (done) => {
      const randomRequest = TestDataGenerator.randomPayload();

      getEventHandlerP(randomRequest, null)
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("BadRequest");

          return getJournalHandlerP(randomRequest, null);
        })
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("BadRequest");

          return getSnapshotHandlerP(randomRequest, null);
        })
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("BadRequest");

          return saveSnapshotHandlerP(randomRequest, null);
        })
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("BadRequest");

          return saveEventsHandlerP(randomRequest, null);
        })
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("BadRequest");
        })
        .then(done)
        .catch(done);
    });

    it("should respond 'NotFound' for missing aggregates", (done) => {
      const aggregateId = TestDataGenerator.randomAggregateId();
      const sequence = TestDataGenerator.randomSequence();
      const getEventRequest = TestDataGenerator.randomLambdaGetEventRequest(aggregateId, sequence);
      const getJournalRequest = TestDataGenerator.randomLambdaGetJournalRequest(aggregateId);
      const getSnapshotRequest = TestDataGenerator.randomLambdaGetSnapshotRequest(aggregateId, sequence);

      getEventHandlerP(getEventRequest, null)
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("NotFound");

          return getJournalHandlerP(getJournalRequest, null);
        })
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("NotFound");

          return getSnapshotHandlerP(getSnapshotRequest, null);
        })
        .then((response) => {
          response.should.exist;
          response.$type.should.exist;
          response.$type.should.equal("NotFound");
        })
        .then(done)
        .catch(done);
    });

    it("should save a sequence of events", (done) => {
      const sampleSize = 50;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const saveEventsRequest = TestDataGenerator.randomLambdaSaveEventsRequest(sampleSize, aggregateId, startSequence);
      const getEventRequest = TestDataGenerator.randomLambdaGetEventRequest(aggregateId, startSequence);
      const getJournalRequest = TestDataGenerator.randomLambdaGetJournalRequest(aggregateId);

      // get the deserialize events for validation
      const events = saveEventsRequest.events;

      saveEventsHandlerP(saveEventsRequest, null)
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
        })
        .then(done)
        .catch(done);
    });

    it("should take a snapshot and get a valid journal", (done) => {
      // const retentionCount = Eventum.config().snapshot.retention.count;
      const sampleSize = 50;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const snapshotSequence = startSequence + sampleSize - 10;
      const saveEventsRequest = TestDataGenerator.randomLambdaSaveEventsRequest(sampleSize, aggregateId, startSequence);
      const saveSnapshotRequest = TestDataGenerator.randomLambdaSaveSnapshotRequest(aggregateId, snapshotSequence);
      const getSnapshotRequest = TestDataGenerator.randomLambdaGetSnapshotRequest(aggregateId, snapshotSequence);
      const getJournalRequest = TestDataGenerator.randomLambdaGetJournalRequest(aggregateId);

      // deserialize input data for validation
      const events = saveEventsRequest.events;
      const payload = saveSnapshotRequest.payload;

      saveEventsHandlerP(saveEventsRequest, null)
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
          response.journal.events.length.should.equals(9);
        })
        .then(done)
        .catch(done);
    });
  });
}

export default aggregatesAPITest;
