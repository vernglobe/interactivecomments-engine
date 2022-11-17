"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../src/index"));
process.env.AWS_LAMBDA_FUNCTION_NAME = "logging.spec.js";
let consoleLogSpy;
let consoleDebugSpy;
let consoleWarnSpy;
let consoleErrorSpy;
// const DATE_TO_USE = new Date();
// let dateSpy: any;
beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    consoleLogSpy = jest.spyOn(global.console, "log").mockImplementation();
    consoleDebugSpy = jest.spyOn(global.console, "debug").mockImplementation();
    consoleWarnSpy = jest.spyOn(global.console, "warn").mockImplementation();
    consoleErrorSpy = jest.spyOn(global.console, "error").mockImplementation();
    /* dateSpy = jest.spyOn(global, "Date").mockImplementation(() => {
      DATE_TO_USE.toISOString = () => {
        return "1";
      };
      return DATE_TO_USE;
    }); */
});
afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleDebugSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    // dateSpy.mockRestore();
});
test("given logging(); when instantiated without a level; then it returns a valid logger with error, and metric", async () => {
    jest.resetModules();
    const actual = await (0, index_1.default)({ name: "jest", level: 30 });
    const messageObject = { message: "This is a test" };
    const messageString = "This is a second test";
    expect(actual.debug).toBeDefined();
    expect(actual.info).toBeDefined();
    expect(actual.warn).toBeDefined();
    expect(actual.error).toBeDefined();
    expect(actual.level).toEqual(30);
    actual.debug(messageObject);
    actual.info(messageObject);
    actual.warn(messageObject);
    actual.error(messageObject);
    actual.debug(messageString);
    actual.info(messageString);
    actual.warn(messageString);
    actual.error(messageString);
    expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
});
/*
test("given logging(); when instantiated at level 20; then it returns a valid logger with at debug, info, error, and metric levels", async () => {
  jest.resetModules();
  const logger = require("../index.js");

  const actual = await logger.createLogger({ name: "jest", level: 20 });
  const messageObject = { message: "This is a test" };
  const messageString = "This is a second test";

  expect(actual.debug).toBeDefined();
  expect(actual.info).toBeDefined();
  expect(actual.warn).toBeDefined();
  expect(actual.error).toBeDefined();
  expect(actual.metric).toBeDefined();
  expect(actual.level).toEqual(20);
  actual.debug(messageObject);
  actual.info(messageObject);
  actual.warn(messageObject);
  actual.error(messageObject);
  actual.metric(messageObject);
  actual.debug(messageString);
  actual.info(messageString);
  actual.warn(messageString);
  actual.error(messageString);
  actual.metric(messageString);
  expect(consoleLogSpy).toHaveBeenCalledTimes(4);
  expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
  expect(consoleDebugSpy).toHaveBeenCalledTimes(2);
  expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

  expect(consoleDebugSpy).toHaveBeenNthCalledWith(
    1,
    '{"message":"This is a test","name":"jest","level":20}'
  );
  expect(consoleLogSpy).toHaveBeenNthCalledWith(
    1,
    '{"message":"This is a test","name":"jest","level":30}'
  );
  expect(consoleWarnSpy).toHaveBeenNthCalledWith(
    1,
    '{"message":"This is a test","name":"jest","level":40}'
  );
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    1,
    '{"message":"This is a test","name":"jest","level":50}'
  );
  expect(consoleLogSpy).toHaveBeenNthCalledWith(
    2,
    '{"message":"This is a test","name":"jest","level":100,"timestamp":1}'
  );
  expect(consoleDebugSpy).toHaveBeenNthCalledWith(
    2,
    '{"message":"This is a second test","name":"jest","level":20}'
  );
  expect(consoleLogSpy).toHaveBeenNthCalledWith(
    3,
    '{"message":"This is a second test","name":"jest","level":30}'
  );
  expect(consoleWarnSpy).toHaveBeenNthCalledWith(
    2,
    '{"message":"This is a second test","name":"jest","level":40}'
  );
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    2,
    '{"message":"This is a second test","name":"jest","level":50}'
  );
  expect(consoleLogSpy).toHaveBeenNthCalledWith(
    4,
    '{"message":"This is a second test","timestamp":1,"name":"jest","level":100}'
  );
});

test("given logging(); when instantiated with level 60; then it returns a valid logger with metric level", async () => {
  jest.resetModules();
  const logger = require("../index.js");

  const actual = await logger.createLogger({ name: "jest", level: 60 });
  const messageObject = {
    message: "This is a test",
    timestamp: new Date().toISOString(),
  };
  const messageString = "This is a second test";

  expect(actual.debug).toBeDefined();
  expect(actual.info).toBeDefined();
  expect(actual.error).toBeDefined();
  expect(actual.metric).toBeDefined();
  expect(actual.level).toEqual(60);
  actual.debug(messageObject);
  actual.info(messageObject);
  actual.warn(messageObject);
  actual.error(messageObject);
  actual.metric(messageObject);
  actual.debug(messageString);
  actual.info(messageString);
  actual.warn(messageString);
  actual.error(messageString);
  actual.metric(messageString);
  expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
  expect(consoleLogSpy).toHaveBeenCalledTimes(2);
  expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
  expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
  expect(consoleLogSpy).toHaveBeenNthCalledWith(
    1,
    '{"message":"This is a test","timestamp":1,"name":"jest","level":100}'
  );
  expect(consoleLogSpy).toHaveBeenNthCalledWith(
    2,
    '{"message":"This is a second test","timestamp":1,"name":"jest","level":100}'
  );

  consoleLogSpy.mockRestore();
  dateSpy.mockRestore();
});

test("given metric(); when metric called with anything other than string or object; then it throws error", async () => {
  jest.resetModules();
  const logger = require("../index.js");

  const actual = await logger.createLogger({ name: "jest", level: 100 });
  const message = undefined;
  expect(actual.debug).toBeDefined();
  expect(actual.info).toBeDefined();
  expect(actual.warn).toBeDefined();
  expect(actual.error).toBeDefined();
  expect(actual.metric).toBeDefined();
  expect(actual.level).toEqual(100);
  actual.info(message);
  actual.error(message);

  expect(() => {
    actual.metric(message);
  }).toThrow("Invalid arguments provided");

  expect(consoleLogSpy).toHaveBeenCalledTimes(0);
});

test("given logging(); when error is provided; then it parses it", async () => {
  jest.resetModules();
  const logger = require("../index.js");
  const actual = await logger.createLogger({ name: "jest" });
  const err = {
    stack:
      "Error: Incorrect data supplied\\n    at Object.Error (C:\\\\Users\\\\aiuhyz9\\\\vcs\\\\packages\\\\common\\\\__tests__\\\\logging.spec.js:142:11)\\n    at process._tickCallback (internal/process/next_tick.js:68:7)",
  };
  actual.error({ error: err, reason: "there was an error" });
  expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    1,
    '{"error":"Error: Incorrect data supplied\\\\n    at Object.Error (C:\\\\\\\\Users\\\\\\\\aiuhyz9\\\\\\\\vcs\\\\\\\\packages\\\\\\\\common\\\\\\\\__tests__\\\\\\\\logging.spec.js:142:11)\\\\n    at process._tickCallback (internal/process/next_tick.js:68:7)","reason":"there was an error","name":"jest","level":50}'
  );
});
*/
