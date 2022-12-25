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
import Stack from "../shared/stack";

export default class CommentsProcessor extends Stack {
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id, props);

    const { ENVIRONMENT } = props || process.env;
    // const ACCOUNT = ENVIRONMENT === "prod" ? ENVIRONMENT : "preprod";

    const LambdaRole = new Role(this, "LambdaRole", {
      roleName: `interactivecomments-${ENVIRONMENT}-lambda-role`,
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

    const commentsProcessor = new Function(this, "CommentsProcessorLambda", {
      functionName: `interactivecomments-${ENVIRONMENT}-comments-processor`,
      runtime: Runtime.NODEJS_16_X,
      tracing: Tracing.ACTIVE,
      handler: "index.handler",
      code: Code.fromAsset(
        path.join(path.resolve("./"), "/src/functions/comments-processor/dist")
      ),
      timeout: Duration.seconds(60),
      role: LambdaRole,
      environment: {
        DYNAMODB_COMMENTS_TABLE: `interactivecomments-${ENVIRONMENT}`,
      },
      memorySize: 128,
    });

    const restApi = new RestApi(this, "interactivecomments", {
      restApiName: `interactivecomments-${ENVIRONMENT}`,
      description: "Create, read, update and delete comment",
      // set up CORS
      /* defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "DELETE", "HEAD", "PATCH"],
        allowCredentials: true,
        allowOrigins: ["http://localhost:3000"]
      } */
    });

    const getLambdaIntegration = new LambdaIntegration(commentsProcessor, {
      requestTemplates: { "application/json": '{"statusCode": "200"}' },
    });

    const comments = restApi.root.addResource("comments");
    comments.addCorsPreflight({
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

    const userComment = comments.addResource("{user_id}");
    // GET /comments
    const getAllComments = userComment.addMethod("GET", getLambdaIntegration, {
      apiKeyRequired: true,
    });
    // POST /comments
    const addComments = userComment.addMethod("POST", getLambdaIntegration, {
      apiKeyRequired: true,
    });

    // GET /comments/{comment_id}
    // DELETE /comments/{comment_id}
    // POST /comments/{comment_id}
    const commentId = userComment.addResource("{comment_id}");
    const getComment = commentId.addMethod("GET", getLambdaIntegration, {
      apiKeyRequired: true,
    });
    const deleteComment = commentId.addMethod("DELETE", getLambdaIntegration, {
      apiKeyRequired: true,
    });
    const updateComment = commentId.addMethod("POST", getLambdaIntegration, {
      apiKeyRequired: true,
    });

    const usagePlan = restApi.addUsagePlan("interactivecomments-usagePlan", {
      name: `interactivecomments-${ENVIRONMENT}`,
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
    });

    // auto generated the key
    const apiKey = restApi.addApiKey("ApiKey");
    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({
      stage: restApi.deploymentStage,
      throttle: [
        {
          method: getAllComments,
          throttle: {
            rateLimit: 100,
            burstLimit: 2,
          },
        },
        {
          method: addComments,
          throttle: {
            rateLimit: 100,
            burstLimit: 2,
          },
        },
        {
          method: getComment,
          throttle: {
            rateLimit: 100,
            burstLimit: 2,
          },
        },
        {
          method: deleteComment,
          throttle: {
            rateLimit: 100,
            burstLimit: 2,
          },
        },
        {
          method: updateComment,
          throttle: {
            rateLimit: 100,
            burstLimit: 2,
          },
        },
      ],
    });

    // Rate Limited API Key
    new RateLimitedApiKey(this, "rate-limited-api-key", {
      customerId: `interactivecomments-${ENVIRONMENT}`,
      resources: [restApi],
      quota: {
        limit: 1000,
        period: Period.MONTH,
      },
    });
  }
}
