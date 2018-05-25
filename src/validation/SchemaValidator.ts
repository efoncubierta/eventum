import { Schema, Validator, ValidatorResult } from "jsonschema";

// model schemas
import { AggregateIdSchema, SequenceSchema, EventSchema, SnapshotSchema } from "./schema/ModelSchema";

// REST API schemas
import { APISaveEventsRequest, APISaveSnapshotRequest } from "../message/APIMessages";

// Eventum configuration schemas
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

// REST API schema
import {
  APIGetEventLambdaRequestSchema,
  APIGetJournalLambdaRequestSchema,
  APIGetSnapshotLambdaRequestSchema,
  APISaveSnapshotLambdaRequestSchema,
  APISaveSnapshotBodyRequestSchema,
  APISaveEventsLambdaRequestSchema,
  APISaveEventsBodyRequestSchema
} from "./schema/APISchema";
import { AWSLambdaEventBodySchema } from "./schema/AWSLambdaSchema";

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

  public static getAPIValidator(): Validator {
    const validator = this.getModelValidator();
    validator.addSchema(AWSLambdaEventBodySchema, AWSLambdaEventBodySchema.id);
    validator.addSchema(APIGetEventLambdaRequestSchema, APIGetEventLambdaRequestSchema.id);
    validator.addSchema(APIGetJournalLambdaRequestSchema, APIGetJournalLambdaRequestSchema.id);
    validator.addSchema(APIGetSnapshotLambdaRequestSchema, APIGetSnapshotLambdaRequestSchema.id);
    validator.addSchema(APISaveSnapshotLambdaRequestSchema, APISaveSnapshotLambdaRequestSchema.id);
    validator.addSchema(APISaveSnapshotBodyRequestSchema, APISaveSnapshotBodyRequestSchema.id);
    validator.addSchema(APISaveEventsLambdaRequestSchema, APISaveEventsLambdaRequestSchema.id);
    validator.addSchema(APISaveEventsBodyRequestSchema, APISaveEventsBodyRequestSchema.id);

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

  public static validateAPIGetEventLambdaRequest(request: any): ValidatorResult {
    const validator = this.getAPIValidator();
    return validator.validate(request, APIGetEventLambdaRequestSchema);
  }

  public static validateAPIGetJournalLambdaRequest(request: any): ValidatorResult {
    const validator = this.getAPIValidator();
    return validator.validate(request, APIGetJournalLambdaRequestSchema);
  }

  public static validateAPIGetSnapshotLambdaRequest(request: any): ValidatorResult {
    const validator = this.getAPIValidator();
    return validator.validate(request, APIGetSnapshotLambdaRequestSchema);
  }

  public static validateAPISaveEventsLambdaRequest(request: any): ValidatorResult {
    const validator = this.getAPIValidator();
    return validator.validate(request, APISaveEventsLambdaRequestSchema);
  }

  public static validateAPISaveEventsBodyRequest(request: APISaveEventsRequest): ValidatorResult {
    const validator = this.getAPIValidator();
    return validator.validate(request, APISaveEventsBodyRequestSchema);
  }

  public static validateAPISaveSnapshotLambdaRequest(request: any): ValidatorResult {
    const validator = this.getAPIValidator();
    return validator.validate(request, APISaveSnapshotLambdaRequestSchema);
  }

  public static validateAPISaveSnapshotBodyRequest(request: APISaveSnapshotRequest): ValidatorResult {
    const validator = this.getAPIValidator();
    return validator.validate(request, APISaveSnapshotBodyRequestSchema);
  }
}
