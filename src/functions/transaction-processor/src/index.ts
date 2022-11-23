/* eslint-disable import/no-import-module-exports */
import Logger from "@vernglobe/logger";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import aws from "@vernglobe/aws";

const logger = new Logger("transaction-processor");
// const bucket = process.env.BUCKET;
const vernforeverTbl = process.env.DYNAMODB_EFOREVER_TABLE;
const DYNAMODB_DOC_CLIENT = "DynamoDB.DocumentClient";

const formatProductList = (rawProducts: any): any => {
  const { Items, Count } = rawProducts;
  if (Count <= 0) {
    return "Content empty.";
  }

  return Items;
};

const getProductsByCategory = async (params: any): Promise<string> => {
  const productlist = await aws(DYNAMODB_DOC_CLIENT, "query", {
    TableName: vernforeverTbl,
    IndexName: "categoryIndexName",
    KeyConditionExpression: "category = :category",
    ExpressionAttributeValues: {
      ":category": `${params.category}`,
    },
    Limit: 1000,
  });

  return formatProductList(productlist);
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
  // logger.info({ event });
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

  const validateReq = validateRequestParams(event);
  if (validateReq.statusCode !== 200) {
    return validateReq;
  }

  try {
    switch (event.httpMethod) {
      case "GET":
        body = await getProductsByCategory(validateReq.queryStringParameters);
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
