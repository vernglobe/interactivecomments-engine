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
import { randomBytes } from "crypto";
import Stack from "../shared/stack";

export default class MembershipProcessor extends Stack {
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id, props);

    const { ENVIRONMENT } = props || process.env;
    // const ACCOUNT = ENVIRONMENT === "prod" ? ENVIRONMENT : "preprod";

    const LambdaRole = new Role(this, "LambdaRole", {
      roleName: `vernforever-${ENVIRONMENT}-membership-lambda-role`,
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

    const bucket = new Bucket(this, `vernforever-${ENVIRONMENT}-membership`);

    const membershipProcessor = new Function(
      this,
      "MembershipProcessorLambda",
      {
        functionName: `vernforever-${ENVIRONMENT}-membership-processor`,
        runtime: Runtime.NODEJS_16_X,
        tracing: Tracing.ACTIVE,
        handler: "index.handler",
        code: Code.fromAsset(
          path.join(
            path.resolve("./"),
            "/src/functions/membership-processor/dist"
          )
        ),
        timeout: Duration.seconds(60),
        role: LambdaRole,
        environment: {
          DYNAMODB_MEMBERSHIP_TABLE: `vernforever-${ENVIRONMENT}-membership`,
          BUCKET: bucket.bucketName,
        },
        memorySize: 128,
      }
    );

    bucket.grantReadWrite(membershipProcessor);

    const restApi = new RestApi(this, "vern-registration", {
      restApiName: `vern-${ENVIRONMENT}-registration service`,
      description: "New member registration",
      // set up CORS
      /* defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "DELETE", "HEAD", "PATCH"],
        allowCredentials: true,
        allowOrigins: ["http://localhost:3000"]
      } */
    });

    const getLambdaIntegration = new LambdaIntegration(membershipProcessor, {
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

    const getMethod = v1.addMethod("GET", getLambdaIntegration, {
      apiKeyRequired: true,
    });
    const postMethod = v1.addMethod("POST", getLambdaIntegration, {
      apiKeyRequired: true,
    });
    const deleteMethod = v1.addMethod("DELETE", getLambdaIntegration, {
      apiKeyRequired: true,
    });

    const usagePlan = restApi.addUsagePlan("vernforever-living-usagePlan", {
      name: `vernforever-${ENVIRONMENT}`,
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
    });

    // auto generated the key
    // const apiKey = restApi.addApiKey("ApiKey");

    // manually assign the key
    const generateKeyPair = (size = 32, format = "base64") => {
      const value = randomBytes(size);
      return value.toString(format);
    };
    const apiKey = restApi.addApiKey("ApiKey", {
      apiKeyName: `vernforever-${ENVIRONMENT}-apikey`,
      value: generateKeyPair(),
    });

    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({
      stage: restApi.deploymentStage,
      throttle: [
        {
          method: getMethod,
          throttle: {
            rateLimit: 10,
            burstLimit: 2,
          },
        },
        {
          method: postMethod,
          throttle: {
            rateLimit: 10,
            burstLimit: 2,
          },
        },
        {
          method: deleteMethod,
          throttle: {
            rateLimit: 10,
            burstLimit: 2,
          },
        },
      ],
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
