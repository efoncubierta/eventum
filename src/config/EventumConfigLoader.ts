import * as yaml from "js-yaml";
import * as fs from "fs";
import { EventumConfig } from "./EventumConfig";
import { SchemaValidator } from "../validation/SchemaValidator";

export class EventumConfigLoader {
  public static load(configFile: string): EventumConfig {
    let eventumConfig;
    try {
      // attempt to load the configuration via Webpack yaml-loader
      eventumConfig = require("json-loader!yaml-loader!../../eventum.yml");
    } catch (e) {
      eventumConfig = yaml.safeLoad(fs.readFileSync(configFile, "utf8"), { json: true });
    }

    // validate configuration
    const result = SchemaValidator.validateEventumConfig(eventumConfig);
    if (result.errors.length > 0) {
      throw new Error(
        `Eventum configuration is not valid: ${result.errors[0].message}. Please review the eventum.yml file`
      );
    }

    return eventumConfig;
  }
}
