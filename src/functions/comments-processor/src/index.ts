/* eslint-disable no-unused-vars */
/* eslint-disable import/no-import-module-exports */
import Logger from "@vernglobe/logger";
import aws from "@vernglobe/aws";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";

const logger = new Logger("comments-processor");

const commentsTbl = process.env.DYNAMODB_COMMENTS_TABLE;
const DYNAMODB_DOC_CLIENT = "DynamoDB.DocumentClient";

const formatComments = (commentList: any): any => {
  const { Items, Count } = commentList;
  if (Count <= 0) {
    return "Content empty.";
  }

  return Items;
};

const getAllComments = async (params: any): Promise<string> => {
  const commentList = await aws(DYNAMODB_DOC_CLIENT, "query", {
    TableName: commentsTbl,
    KeyConditionExpression: "username = :username",
    ExpressionAttributeValues: {
      ":username": `${params.username}`,
    },
    Limit: 1000,
  });

  return formatComments(commentList);
};

const validateRequestParams = (event: APIGatewayEvent): any => {
  const { queryStringParameters, body, httpMethod } = event;

  const requestBody = body ? JSON.parse(body) : null;
  const statusCode = 200;
  const response: any = {
    statusCode,
    body,
  };

  if (httpMethod === "POST" && !requestBody) {
    response.statusCode = 400;
    response.body = "The request content cannot be empty!";
  }

  if (
    httpMethod === "GET" &&
    (!queryStringParameters || !queryStringParameters.category)
  ) {
    response.statusCode = 400;
    response.body = "The product category cannot be empty!";
  }

  response.queryStringParameters = queryStringParameters;
  return response;
};

exports.handler = async (
  event: APIGatewayEvent,
  // eslint-disable-next-line no-unused-vars
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.debug({ event });
  // logger.info({ context });
  let statusCode = 200;
  let { body } = event;
  const headers = {
    ContentType: "application/json",
    "X-Requested-With": "*",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
  };

  /* const validateReq = validateRequestParams(event);
  if (validateReq.statusCode !== 200) {
    return validateReq;
  }
  */

  try {
    switch (event.httpMethod) {
      case "GET":
        // body = await getAllComments(validateReq.queryStringParameters);
        break;
      case "POST":
        break;
      case "DELETE":
        break;
      default:
        throw Error(`Unsupported method "${event.httpMethod}"`);
    }
  } catch (error) {
    statusCode = 400;
    if (error instanceof Error) {
      body = error.message;
    }
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
