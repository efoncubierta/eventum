import * as deepmerge from "deepmerge";
import { EventumConfig } from "./config/EventumConfig";
import { EventumConfigLoader } from "./config/EventumConfigLoader";

/**
 * Eventum main class for bootstrapping and configuring the execution context.
 */
export class Eventum {
  private static configFile: string = "eventum.yml";
  private static defaultConfig: EventumConfig;
  private static currentConfig: EventumConfig;

  public static config(config?: EventumConfig): EventumConfig {
    // read Eventum configuration from file
    if (!this.defaultConfig) {
      this.resetConfig();
    }

    if (config) {
      this.currentConfig = deepmerge.all([this.defaultConfig, config]);
    }

    return this.currentConfig;
  }

  public static setConfigFile(file: string): void {
    this.configFile = file;
  }

  public static resetConfig(): EventumConfig {
    this.defaultConfig = EventumConfigLoader.load(this.configFile);
    this.currentConfig = this.defaultConfig;

    return this.currentConfig;
  }
}
