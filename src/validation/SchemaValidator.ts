import { Schema, Validator, ValidatorResult } from "jsonschema";

// model schemas
import {
  AggregateIdSchema,
  SequenceSchema,
  DateSchema,
  EventIdSchema,
  EventSchema,
  EventKeySchema,
  EventInputSchema,
  EventInputArraySchema,
  EventPayloadSchema,
  SnapshotIdSchema,
  SnapshotSchema,
  SnapshotKeySchema,
  SnapshotInputSchema,
  SnapshotPayloadSchema,
  JournalSchema,
  JournalKeySchema
} from "./schema/ModelSchema";

// Eventum configuration schemas
import {
  EventumConfigSchema,
  EventumConfigProviderSchema,
  EventumAWSConfigSchema,
  EventumAWSDynamoDBConfigSchema,
  EventumAWSDynamoDBTableConfigSchema,
  EventumSnapshotConfigSchema,
  EventumSnapshotRetentionConfigSchema
} from "./schema/EventumConfigSchema";
import { EventumConfig } from "../config/EventumConfig";

// REST API schema
import { Event, EventKey, EventInput } from "../model/Event";
import { Snapshot, SnapshotKey, SnapshotInput } from "../model/Snapshot";
import { Journal, JournalKey } from "../model/Journal";

/**
 * Validator for JSON schemas.
 */
export class SchemaValidator {
  public static getModelValidator(): Validator {
    const validator = new Validator();

    validator.addSchema(AggregateIdSchema, AggregateIdSchema.id);
    validator.addSchema(SequenceSchema, SequenceSchema.id);
    validator.addSchema(DateSchema, DateSchema.id);

    validator.addSchema(EventSchema, EventSchema.id);
    validator.addSchema(EventIdSchema, EventIdSchema.id);
    validator.addSchema(EventKeySchema, EventKeySchema.id);
    validator.addSchema(EventInputSchema, EventInputSchema.id);
    validator.addSchema(EventInputArraySchema, EventInputArraySchema.id);
    validator.addSchema(EventPayloadSchema, EventPayloadSchema.id);

    validator.addSchema(SnapshotSchema, SnapshotSchema.id);
    validator.addSchema(SnapshotIdSchema, SnapshotIdSchema.id);
    validator.addSchema(SnapshotKeySchema, SnapshotKeySchema.id);
    validator.addSchema(SnapshotInputSchema, SnapshotInputSchema.id);
    validator.addSchema(SnapshotPayloadSchema, SnapshotPayloadSchema.id);

    validator.addSchema(JournalSchema, JournalSchema.id);
    validator.addSchema(JournalKeySchema, JournalKeySchema.id);

    return validator;
  }

  public static getEventumConfigValidator(): Validator {
    const validator = new Validator();
    validator.addSchema(EventumConfigSchema, EventumConfigSchema.id);
    validator.addSchema(EventumConfigProviderSchema, EventumConfigProviderSchema.id);
    validator.addSchema(EventumAWSConfigSchema, EventumAWSConfigSchema.id);
    validator.addSchema(EventumAWSDynamoDBConfigSchema, EventumAWSDynamoDBConfigSchema.id);
    validator.addSchema(EventumAWSDynamoDBTableConfigSchema, EventumAWSDynamoDBTableConfigSchema.id);
    validator.addSchema(EventumSnapshotConfigSchema, EventumSnapshotConfigSchema.id);
    validator.addSchema(EventumSnapshotRetentionConfigSchema, EventumSnapshotRetentionConfigSchema.id);

    return validator;
  }

  public static validateEventumConfig(config: EventumConfig): ValidatorResult {
    const validator = this.getEventumConfigValidator();
    return validator.validate(config, EventumConfigSchema);
  }

  public static validateEvent(event: Event): ValidatorResult {
    const validator = this.getModelValidator();
    return validator.validate(event, EventSchema);
  }

  public static validateEventKey(eventKey: EventKey): ValidatorResult {
    const validator = this.getModelValidator();
    return validator.validate(eventKey, EventKeySchema);
  }

  public static validateEventInput(eventInput: EventInput): ValidatorResult {
    const validator = this.getModelValidator();
    return validator.validate(eventInput, EventInputSchema);
  }

  public static validateEventInputArray(eventInputs: EventInput[]): ValidatorResult {
    const validator = this.getModelValidator();
    return validator.validate(eventInputs, EventInputArraySchema);
  }

  public static validateSnapshot(snapshot: Snapshot): ValidatorResult {
    const validator = this.getModelValidator();
    return validator.validate(snapshot, SnapshotSchema);
  }

  public static validateSnapshotKey(snapshotKey: SnapshotKey): ValidatorResult {
    const validator = this.getModelValidator();
    return validator.validate(snapshotKey, SnapshotKeySchema);
  }

  public static validateSnapshotInput(snapshotInput: SnapshotInput): ValidatorResult {
    const validator = this.getModelValidator();
    return validator.validate(snapshotInput, SnapshotInputSchema);
  }

  public static validateJournal(journal: Journal): ValidatorResult {
    const validator = this.getModelValidator();
    return validator.validate(journal, JournalSchema);
  }

  public static validateJournalKey(journalKey: JournalKey): ValidatorResult {
    const validator = this.getModelValidator();
    return validator.validate(journalKey, JournalKeySchema);
  }
}
