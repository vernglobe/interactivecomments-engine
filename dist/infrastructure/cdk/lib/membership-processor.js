"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_apigateway_1 = require("aws-cdk-lib/aws-apigateway");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const crypto_1 = require("crypto");
const stack_1 = __importDefault(require("../shared/stack"));
class MembershipProcessor extends stack_1.default {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { ENVIRONMENT } = props || process.env;
        // const ACCOUNT = ENVIRONMENT === "prod" ? ENVIRONMENT : "preprod";
        const LambdaRole = new aws_iam_1.Role(this, "LambdaRole", {
            roleName: `vernforever-${ENVIRONMENT}-membership-lambda-role`,
            assumedBy: new aws_iam_1.ServicePrincipal("lambda.amazonaws.com"),
        });
        LambdaRole.addToPolicy(new aws_iam_1.PolicyStatement({
            resources: ["*"],
            actions: [
                "dynamodb:*",
                "s3:*",
                "logs:*",
                "cloudwatch:*",
                "sns:*",
                "sqs:*",
            ],
        }));
        const bucket = new aws_s3_1.Bucket(this, `vernforever-${ENVIRONMENT}-membership`);
        const membershipProcessor = new aws_lambda_1.Function(this, "MembershipProcessorLambda", {
            functionName: `vernforever-${ENVIRONMENT}-membership-processor`,
            runtime: aws_lambda_1.Runtime.NODEJS_16_X,
            tracing: aws_lambda_1.Tracing.ACTIVE,
            handler: "index.handler",
            code: aws_lambda_1.Code.fromAsset(path.join(path.resolve("./"), "/src/functions/membership-processor/dist")),
            timeout: aws_cdk_lib_1.Duration.seconds(60),
            role: LambdaRole,
            environment: {
                DYNAMODB_MEMBERSHIP_TABLE: `vernforever-${ENVIRONMENT}-membership`,
                BUCKET: bucket.bucketName,
            },
            memorySize: 128,
        });
        bucket.grantReadWrite(membershipProcessor);
        const restApi = new aws_apigateway_1.RestApi(this, "vern-registration", {
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
        const getLambdaIntegration = new aws_apigateway_1.LambdaIntegration(membershipProcessor, {
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
            const value = (0, crypto_1.randomBytes)(size);
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
        new aws_apigateway_1.RateLimitedApiKey(this, "rate-limited-api-key", {
            customerId: `vernforever-${ENVIRONMENT}`,
            resources: [restApi],
            quota: {
                limit: 1000,
                period: aws_apigateway_1.Period.MONTH,
            },
        });
    }
}
exports.default = MembershipProcessor;
