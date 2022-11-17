"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-new */
const aws_cdk_lib_1 = require("aws-cdk-lib");
const tables_1 = __importDefault(require("./lib/tables"));
const membership_processor_1 = __importDefault(require("./lib/membership-processor"));
const app = new aws_cdk_lib_1.App();
const { ENVIRONMENT = "stage" } = process.env;
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};
new tables_1.default(app, `vernforever-${ENVIRONMENT}-dynamodb`, { ENVIRONMENT });
new membership_processor_1.default(app, `vernforever-${ENVIRONMENT}-membership-processor`, {
    env,
    ENVIRONMENT,
});
app.synth();
