import { Schema, Validator, ValidatorResult } from "jsonschema";
import { AggregateIdSchema, SequenceSchema, EventSchema, SnapshotSchema } from "./schema/ModelSchema";
import {
  JournalSaveEventsRequestSchema,
  JournalGetJournalRequestSchema,
  JournalCreateSnapshotRequestSchema
} from "./schema/LambdaJournalSchema";
import {
  JournalSaveEventsRequest,
  JournalCreateSnapshotRequest,
  JournalGetJournalRequest
} from "../message/LambdaJournal";
import { EventStreamPublishRequest } from "../message/LambdaEventStream";
import { EventStreamPublishRequestSchema } from "./schema/LambdaEventStreamSchema";

import {
  EventumConfigSchema,
  EventumConfigProviderSchema,
  EventumAWSConfigSchema,
  EventumAWSStoresConfigSchema,
  EventumAWSStoresStoreConfigSchema,
  EventumAWSStreamsConfigSchema,
  EventumAWSStreamsStreamConfigSchema,
  EventumSnapshotConfigSchema,
  EventumSnapshotRetentionConfigSchema
} from "./schema/EventumConfigSchema";
import { EventumConfig } from "../config/EventumConfig";

/**
 * Validator for JSON schemas.
 */
export class SchemaValidator {
  public static getLambdaValidator(): Validator {
    const validator = new Validator();
    validator.addSchema(AggregateIdSchema, AggregateIdSchema.id);
    validator.addSchema(SequenceSchema, SequenceSchema.id);
    validator.addSchema(EventSchema, EventSchema.id);
    validator.addSchema(SnapshotSchema, SnapshotSchema.id);

    return validator;
  }

  public static getEventumConfigValidator(): Validator {
    const validator = new Validator();
    validator.addSchema(EventumConfigSchema, EventumConfigSchema.id);
    validator.addSchema(EventumConfigProviderSchema, EventumConfigProviderSchema.id);
    validator.addSchema(EventumAWSConfigSchema, EventumAWSConfigSchema.id);
    validator.addSchema(EventumAWSStoresConfigSchema, EventumAWSStoresConfigSchema.id);
    validator.addSchema(EventumAWSStoresStoreConfigSchema, EventumAWSStoresStoreConfigSchema.id);
    validator.addSchema(EventumAWSStreamsConfigSchema, EventumAWSStreamsConfigSchema.id);
    validator.addSchema(EventumAWSStreamsStreamConfigSchema, EventumAWSStreamsStreamConfigSchema.id);
    validator.addSchema(EventumSnapshotConfigSchema, EventumSnapshotConfigSchema.id);
    validator.addSchema(EventumSnapshotRetentionConfigSchema, EventumSnapshotRetentionConfigSchema.id);

    return validator;
  }

  public static validateEventumConfig(config: EventumConfig): ValidatorResult {
    const validator = this.getEventumConfigValidator();
    return validator.validate(config, EventumConfigSchema);
  }

  public static validateJournalSaveEventsRequest(request: JournalSaveEventsRequest): ValidatorResult {
    const validator = this.getLambdaValidator();
    return validator.validate(request, JournalSaveEventsRequestSchema);
  }

  public static validateJournalGetJournalRequest(request: JournalGetJournalRequest): ValidatorResult {
    const validator = this.getLambdaValidator();
    return validator.validate(request, JournalGetJournalRequestSchema);
  }

  public static validateJournalCreateSnapshotRequest(request: JournalCreateSnapshotRequest): ValidatorResult {
    const validator = this.getLambdaValidator();
    return validator.validate(request, JournalCreateSnapshotRequestSchema);
  }

  public static validateEventStreamPublishRequest(request: EventStreamPublishRequest): ValidatorResult {
    const validator = this.getLambdaValidator();
    return validator.validate(request, EventStreamPublishRequestSchema);
  }
}
