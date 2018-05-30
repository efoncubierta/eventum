import { Schema, Validator, ValidatorResult } from "jsonschema";

// model schemas
import { AggregateIdSchema, SequenceSchema, EventSchema, SnapshotSchema, JournalSchema } from "./schema/ModelSchema";

// REST API schemas
import {
  LambdaSaveEventsRequest,
  LambdaSaveSnapshotRequest,
  LambdaGetSnapshotRequest,
  LambdaGetJournalRequest,
  LambdaGetEventRequest
} from "../message/LambdaMessages";

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
import {
  LambdaGetEventSchema,
  LambdaGetJournalSchema,
  LambdaGetSnapshotSchema,
  LambdaSaveSnapshotSchema,
  LambdaSaveEventsSchema
} from "./schema/LambdaSchema";
import { Event } from "../model/Event";
import { Snapshot } from "../model/Snapshot";
import { Journal } from "../model/Journal";

/**
 * Validator for JSON schemas.
 */
export class SchemaValidator {
  public static getModelValidator(): Validator {
    const validator = new Validator();
    validator.addSchema(AggregateIdSchema, AggregateIdSchema.id);
    validator.addSchema(SequenceSchema, SequenceSchema.id);
    validator.addSchema(EventSchema, EventSchema.id);
    validator.addSchema(SnapshotSchema, SnapshotSchema.id);

    return validator;
  }

  public static getLambdaValidator(): Validator {
    const validator = this.getModelValidator();
    validator.addSchema(LambdaGetEventSchema, LambdaGetEventSchema.id);
    validator.addSchema(LambdaGetJournalSchema, LambdaGetJournalSchema.id);
    validator.addSchema(LambdaGetSnapshotSchema, LambdaGetSnapshotSchema.id);
    validator.addSchema(LambdaSaveSnapshotSchema, LambdaSaveSnapshotSchema.id);
    validator.addSchema(LambdaSaveEventsSchema, LambdaSaveEventsSchema.id);

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

  public static validateSnapshot(snapshot: Snapshot): ValidatorResult {
    const validator = this.getModelValidator();
    return validator.validate(snapshot, SnapshotSchema);
  }

  public static validateJournal(journal: Journal): ValidatorResult {
    const validator = this.getModelValidator();
    return validator.validate(journal, JournalSchema);
  }

  public static validateLambdaGetEventRequest(request: LambdaGetEventRequest): ValidatorResult {
    const validator = this.getLambdaValidator();
    return validator.validate(request, LambdaGetEventSchema);
  }

  public static validateLambdaGetJournalRequest(request: LambdaGetJournalRequest): ValidatorResult {
    const validator = this.getLambdaValidator();
    return validator.validate(request, LambdaGetJournalSchema);
  }

  public static validateLambdaGetSnapshotRequest(request: LambdaGetSnapshotRequest): ValidatorResult {
    const validator = this.getLambdaValidator();
    return validator.validate(request, LambdaGetSnapshotSchema);
  }

  public static validateLambdaSaveEventsRequest(request: LambdaSaveEventsRequest): ValidatorResult {
    const validator = this.getLambdaValidator();
    return validator.validate(request, LambdaSaveEventsSchema);
  }

  public static validateLambdaSaveSnapshotRequest(request: LambdaSaveSnapshotRequest): ValidatorResult {
    const validator = this.getLambdaValidator();
    return validator.validate(request, LambdaSaveSnapshotSchema);
  }
}
