/* eslint-disable no-new */
import { App } from "aws-cdk-lib";
import DynamoTables from "./lib/tables";
import CommentsProcessor from "./lib/comments-processor";

const app = new App();
const { ENVIRONMENT = "stage" } = process.env;
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new DynamoTables(app, `interactivecomments-${ENVIRONMENT}-comments-dynamodb`, {
  ENVIRONMENT,
});

new CommentsProcessor(
  app,
  `interactivecomments-${ENVIRONMENT}-comments-processor`,
  {
    env,
    ENVIRONMENT,
  }
);

app.synth();
