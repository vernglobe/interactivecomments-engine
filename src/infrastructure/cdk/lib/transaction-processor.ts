import * as path from "path";
import { Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Runtime, Tracing, Code, Function } from "aws-cdk-lib/aws-lambda";
import {
  RestApi,
  LambdaIntegration,
  // ApiKey,
  RateLimitedApiKey,
  Period,
} from "aws-cdk-lib/aws-apigateway";
import { Bucket } from "aws-cdk-lib/aws-s3";
import Stack from "../shared/stack";

export default class TransactionProcessor extends Stack {
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id, props);

    const { ENVIRONMENT } = props || process.env;
    // const ACCOUNT = ENVIRONMENT === "prod" ? ENVIRONMENT : "preprod";

    const LambdaRole = new Role(this, "LambdaRole", {
      roleName: `vernforever-${ENVIRONMENT}-transaction-lambda-role`,
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });

    LambdaRole.addToPolicy(
      new PolicyStatement({
        resources: ["*"],
        actions: [
          "dynamodb:*",
          "s3:*",
          "logs:*",
          "cloudwatch:*",
          "sns:*",
          "sqs:*",
        ],
      })
    );

    const bucket = new Bucket(this, `vernforever-${ENVIRONMENT}-transaction`, {
      bucketName: `vernforever-${ENVIRONMENT}-transaction`,
    });

    const transactionProcessor = new Function(
      this,
      "TransactionProcessorLambda",
      {
        functionName: `vernforever-${ENVIRONMENT}-transaction-processor`,
        runtime: Runtime.NODEJS_16_X,
        tracing: Tracing.ACTIVE,
        handler: "index.handler",
        code: Code.fromAsset(
          path.join(
            path.resolve("./"),
            "/src/functions/transaction-processor/dist"
          )
        ),
        timeout: Duration.seconds(60),
        role: LambdaRole,
        environment: {
          DYNAMODB_EFOREVER_TABLE: `vernforever-${ENVIRONMENT}`,
          BUCKET: bucket.bucketName,
        },
        memorySize: 128,
      }
    );

    bucket.grantReadWrite(transactionProcessor);

    const restApi = new RestApi(this, "vern-transaction", {
      restApiName: `vern-${ENVIRONMENT}-transaction service`,
      description: "New member transaction",
      // set up CORS
      /* defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "DELETE", "HEAD", "PATCH"],
        allowCredentials: true,
        allowOrigins: ["http://localhost:3000"]
      } */
    });

    const getLambdaIntegration = new LambdaIntegration(transactionProcessor, {
      requestTemplates: { "application/json": '{"statusCode": "200"}' },
    });

    const v1 = restApi.root.addResource("v1");
    v1.addCorsPreflight({
      allowHeaders: [
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      ],
      allowMethods: [
        "OPTIONS",
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "HEAD",
        "PATCH",
      ],
      allowCredentials: true,
      allowOrigins: ["http://localhost:3000"],
    });

    v1.addMethod("GET", getLambdaIntegration, {
      apiKeyRequired: true,
    });
    v1.addMethod("POST", getLambdaIntegration, {
      apiKeyRequired: true,
    });
    v1.addMethod("DELETE", getLambdaIntegration, {
      apiKeyRequired: true,
    });

    // Rate Limited API Key
    new RateLimitedApiKey(this, "rate-limited-api-key", {
      customerId: `vernforever-${ENVIRONMENT}`,
      resources: [restApi],
      quota: {
        limit: 1000,
        period: Period.MONTH,
      },
    });
  }
}
