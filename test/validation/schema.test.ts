// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// test dependencies
import { TestDataGenerator } from "../util/TestDataGenerator";
import { SchemaValidator } from "../../src/validation/SchemaValidator";

function schemaValidationTests() {
  describe("Schema", () => {
    before(() => {
      // setup chai
      chai.should();
      chai.use(chaiAsPromised);
    });

    it("should validate good random model objects", () => {
      // validate Event
      const validEvent = TestDataGenerator.randomEvent();
      const validateEventResult = SchemaValidator.validateEvent(validEvent);
      validateEventResult.errors.should.be.length(0);

      // validate Snapshot
      const validSnapshot = TestDataGenerator.randomSnapshot();
      const validateSnapshotResult = SchemaValidator.validateSnapshot(validSnapshot);
      validateSnapshotResult.errors.should.be.length(0);

      // validate Journal
      const validJournal = TestDataGenerator.randomJournal();
      const validateJournalResult = SchemaValidator.validateJournal(validJournal);
      validateJournalResult.errors.should.be.length(0);
    });

    it("should not pass invalid random model objects", () => {
      // validate Event
      const validateEventResult = SchemaValidator.validateEvent(TestDataGenerator.randomPayload());
      validateEventResult.errors.should.not.be.length(0);

      // validate Snapshot
      const validateSnapshotResult = SchemaValidator.validateSnapshot(TestDataGenerator.randomPayload());
      validateSnapshotResult.errors.should.not.be.length(0);

      // validate Journal
      const validateJournalResult = SchemaValidator.validateJournal(TestDataGenerator.randomPayload());
      validateJournalResult.errors.should.not.be.length(0);
    });
  });
}

export default schemaValidationTests;
