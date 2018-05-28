import * as deepmerge from "deepmerge";
import { EventumConfig, EventumProvider, EventumConfigDefault } from "./config/EventumConfig";

/**
 * Eventum main class for bootstrapping and configuring the execution context.
 */
export class Eventum {
  private static defaultConfig: EventumConfig = EventumConfigDefault;
  private static currentConfig: EventumConfig = EventumConfigDefault;

  public static config(config?: EventumConfig): EventumConfig {
    if (config) {
      Eventum.currentConfig = deepmerge.all([Eventum.currentConfig, config]);
    }

    return Eventum.currentConfig;
  }

  public static resetConfig(): void {
    Eventum.currentConfig = Eventum.defaultConfig;
  }
}
