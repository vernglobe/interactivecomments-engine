/* eslint-disable no-new */
import { App } from "aws-cdk-lib";
import DynamoTables from "./lib/tables";
import MembershipProcessor from "./lib/membership-processor";
import TransactionProcessor from "./lib/transaction-processor";

const app = new App();
const { ENVIRONMENT = "stage" } = process.env;
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new DynamoTables(app, `vernforever-${ENVIRONMENT}-dynamodb`, { ENVIRONMENT });

const transactionProcessor = new TransactionProcessor(
  app,
  `vernforever-${ENVIRONMENT}-transaction-processor`,
  { env, ENVIRONMENT }
);

const membershipProcessor = new MembershipProcessor(
  app,
  `vernforever-${ENVIRONMENT}-membership-processor`,
  {
    env,
    ENVIRONMENT,
  }
);

membershipProcessor.addDependency(transactionProcessor);

app.synth();
