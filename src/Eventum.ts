import * as deepmerge from "deepmerge";
import { EventumConfig, EventumProvider, EventumConfigDefault } from "./config/EventumConfig";
import { SchemaValidator } from "./validation/SchemaValidator";

/**
 * Eventum main class for bootstrapping and configuring the execution context.
 */
export class Eventum {
  private static defaultConfig: EventumConfig = EventumConfigDefault;
  private static currentConfig: EventumConfig = EventumConfigDefault;

  public static config(config?: Partial<EventumConfig>): EventumConfig {
    if (config) {
      const newConfig = deepmerge.all([Eventum.currentConfig, config]);
      const validationResult = SchemaValidator.validateEventumConfig(newConfig);
      if (validationResult.throwError) {
        throw validationResult.errors[0];
      }

      Eventum.currentConfig = newConfig;
    }

    return Eventum.currentConfig;
  }

  public static resetConfig(): void {
    Eventum.currentConfig = Eventum.defaultConfig;
  }
}
