/* eslint-disable import/no-import-module-exports */
import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import aws from "@vernglobe/aws";
import Logger from "@vernglobe/logger";
import Account from "./account";
// import Account from "../../../packages/common/entities/account";

// const S3 = new AWS.S3();

const logger = new Logger("vernforever-membership-procesor");
const bucket = process.env.BUCKET;
const membershipTbl = process.env.DYNAMODB_MEMBERSHIP_TABLE;
const DYNAMODB_DOC_CLIENT = "DynamoDB.DocumentClient";

const updateRegistrationData = async (reqParam: any): Promise<string> => {
  const reqParamJson = JSON.parse(reqParam);
  const bucketName = bucket || "default-bucket-name";
  const key = reqParamJson.name ? reqParamJson.name : "avenue2022.png";
  const buf = Buffer.from(
    reqParamJson.file.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  const type = reqParamJson.type ? reqParamJson.type : "image/png";
  // const profile = JSON.parse(reqParamJson.profile);
  // const account = new Account(profile);
  // console.log({ account });

  const item = new Account(reqParamJson.profile);
  const respTbl = await aws(DYNAMODB_DOC_CLIENT, "put", {
    TableName: membershipTbl,
    Item: item,
  });

  logger.info({ respTbl });

  const respS3 = await aws("S3", "putObject", {
    Bucket: bucketName,
    Key: key,
    Body: buf,
    ContentEncoding: "base64",
    ContentType: type,
  });
  logger.info({ respS3 });

  return "Successfully store the file!";
};

const validateRequestParams = (body: any) => {
  const requestBody = body ? JSON.parse(body) : null;
  const statusCode = 200;
  const response: any = {
    statusCode,
    body,
  };

  if (!requestBody) {
    response.statusCode = 400;
    response.body = "Profile cannot be empty!";
  }

  // size is in byte. 1 kb = 1000 byte. 1mb = 1000kb
  const size = requestBody.size ? requestBody.size : 0;
  if (size <= 0) {
    response.statusCode = 400;
    response.body = "No file uploaded!";
  }

  if (size >= 1000000) {
    response.statusCode = 400;
    response.body = "The file size must less than 1MB!";
  }

  const profile = requestBody.profile ? requestBody.profile : "";
  if (!profile) {
    response.statusCode = 400;
    response.body = "Profile incomplete!";
  }

  return response;
};

// exports.handler = async (event, context) => {
exports.handler = async (
  event: APIGatewayEvent,
  // eslint-disable-next-line no-unused-vars
  context: Context
): Promise<APIGatewayProxyResult> => {
  // logger.info(`Event: ${JSON.stringify(event, null, 2)}`);
  // logger.info(`Context: ${JSON.stringify(context, null, 2)}`);
  let { body } = event;
  let statusCode = 200;
  const headers = { ContentType: "application/json" };

  const validateReq = validateRequestParams(body);
  if (validateReq.statusCode !== 200) {
    return validateReq;
  }

  try {
    switch (event.httpMethod) {
      case "GET":
        body = "";
        break;
      case "POST":
        body = await updateRegistrationData(validateReq.body);
        break;
      default:
        throw new Error(`Unsupported method "${event.httpMethod}"`);
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
