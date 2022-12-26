/* eslint-disable no-unused-vars */
/* eslint-disable import/no-import-module-exports */
import Logger from "@vernglobe/logger";
import aws from "@vernglobe/aws";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import {
  getAllComments,
  getCommentById,
  deleteComment,
  addComment,
  updateComments,
} from "./services/interactivecomments";

const logger = new Logger("comments-processor");

type PathParametersType = {
  user_id: string;
  comment_id?: number;
};

const ERR_MSG_MISSING_COMMENT_ID =
  "Please specify the value for path parameter {comment_id}.";

const validateRequestParams = (event: APIGatewayEvent): any => {
  const { pathParameters, body, httpMethod } = event;

  const requestBody = body ? JSON.parse(body) : null;
  const statusCode = 200;
  const response: any = {
    statusCode,
    body,
  };

  if (["DELETE"].includes(httpMethod) && !pathParameters?.comment_id) {
    response.statusCode = 400;
    response.body = ERR_MSG_MISSING_COMMENT_ID;
    return response;
  }

  if (httpMethod === "POST") {
    response.content = requestBody.content;
    response.score = requestBody.score;
    response.newComment = requestBody.newComment;
    response.parentId = requestBody.parentId;
  }

  response.pathParameters = pathParameters;
  return response;
};

const retrieveComments = async (commentId: number | undefined) => {
  let resp = null;

  if (commentId) {
    resp = await getCommentById(commentId);
  } else {
    resp = await getAllComments();
  }

  return resp;
};

exports.handler = async (
  event: APIGatewayEvent,
  // eslint-disable-next-line no-unused-vars
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.debug({ event });

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

  const { content, score, replies, newComment, parentId } = validateReq;
  try {
    switch (event.httpMethod) {
      case "GET":
        body = await retrieveComments(validateReq.pathParameters?.comment_id);
        break;
      case "POST":
        if (validateReq.pathParameters?.comment_id) {
          body = await updateComments(
            validateReq.pathParameters?.comment_id,
            parentId,
            content,
            score
          );
        } else {
          body = await addComment(newComment, parentId);
        }
        break;
      case "DELETE":
        body = await deleteComment(validateReq.pathParameters?.comment_id);
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

  if (body.includes("failed")) {
    statusCode = 400;
  }

  return {
    statusCode,
    body,
    headers,
  };
};
