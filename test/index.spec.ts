// tslint:disable:no-unused-expression
import "mocha";
import * as path from "path";

import { Eventum } from "../src/Eventum";

import lambdaTest from "./lambda";
import serviceTest from "./service";
import storeTest from "./store";

// configure eventum for testing
Eventum.setConfigFile(path.join(__dirname, "eventum.yml"));

describe("Eventum", () => {
  lambdaTest();
  serviceTest();
  storeTest();
});
