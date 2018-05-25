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
import { handler as getEventHandler } from "../../../src/lambda/api/aggregates/events/get";
import { handler as getJournalHandler } from "../../../src/lambda/api/aggregates/journal/get";
import { handler as getSnapshotHandler } from "../../../src/lambda/api/aggregates/snapshots/get";
import { handler as saveSnapshotHandler } from "../../../src/lambda/api/aggregates/snapshots/post";
import { handler as saveEventsHandler } from "../../../src/lambda/api/events/post";

// promisify lambda functions
const getEventHandlerP = promisify(getEventHandler);
const getJournalHandlerP = promisify(getJournalHandler);
const getSnapshotHandlerP = promisify(getSnapshotHandler);
const saveSnapshotHandlerP = promisify(saveSnapshotHandler);
const saveEventsHandlerP = promisify(saveEventsHandler);

function aggregatesAPITest() {
  describe("api/aggregates/*", () => {
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
      const sampleSize = 100;
      const aggregateId = TestDataGenerator.randomAggregateId();
      const startSequence = TestDataGenerator.randomSequence();
      const saveEventsLambdaEvent = TestDataGenerator.randomSaveEventsLambdaEvent(
        sampleSize,
        aggregateId,
        startSequence
      );
      const getEventLambdaEvent = TestDataGenerator.randomGetEventLambdaEvent(aggregateId, startSequence);
      const getJournalLambdaEvent = TestDataGenerator.randomGetJournalLambdaEvent(aggregateId);

      // get the deserialize events for validation
      const events = JSON.parse(saveEventsLambdaEvent.body).events;

      saveEventsHandlerP(saveEventsLambdaEvent, null)
        .then((response) => {
          response.should.exist;
          response.statusCode.should.equals(200);

          return getEventHandlerP(getEventLambdaEvent, null);
        })
        .then((response) => {
          response.should.exist;
          response.statusCode.should.equals(200);

          const event = JSON.parse(response.body);

          event.should.exist;
          event.should.eql(events[0]);

          return getJournalHandlerP(getJournalLambdaEvent, null);
        })
        .then((response) => {
          response.should.exist;
          response.statusCode.should.equals(200);

          const journal = JSON.parse(response.body);
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
      const saveEventsLambdaEvent = TestDataGenerator.randomSaveEventsLambdaEvent(
        sampleSize,
        aggregateId,
        startSequence
      );
      const saveSnapshotLambdaEvent = TestDataGenerator.randomSaveSnapshotLambdaEvent(aggregateId, snapshotSequence);
      const getSnapshotLambdaEvent = TestDataGenerator.randomGetSnapshotLambdaEvent(aggregateId, snapshotSequence);
      const getJournalLambdaEvent = TestDataGenerator.randomGetJournalLambdaEvent(aggregateId);

      // deserialize input data for validation
      const events = JSON.parse(saveEventsLambdaEvent.body).events;
      const payload = JSON.parse(saveSnapshotLambdaEvent.body).payload;

      saveEventsHandlerP(saveEventsLambdaEvent, null)
        .then((response) => {
          response.should.exist;
          response.statusCode.should.equals(200);

          return saveSnapshotHandlerP(saveSnapshotLambdaEvent, null);
        })
        .then((response) => {
          response.should.exist;
          response.statusCode.should.equals(200);

          return getSnapshotHandlerP(getSnapshotLambdaEvent, null);
        })
        .then((response) => {
          response.should.exist;
          response.statusCode.should.equals(200);

          const snapshot = JSON.parse(response.body);
          snapshot.should.exist;
          snapshot.aggregateId.should.equal(aggregateId);
          snapshot.sequence.should.equal(snapshotSequence);
          snapshot.payload.should.eql(payload);

          return getJournalHandlerP(getJournalLambdaEvent, null);
        })
        .then((response) => {
          response.should.exist;
          response.statusCode.should.equals(200);

          const journal = JSON.parse(response.body);
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

export default aggregatesAPITest;
