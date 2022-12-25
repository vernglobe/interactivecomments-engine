/* eslint-disable no-unused-vars */
/* eslint-disable import/no-import-module-exports */
import Logger from "@vernglobe/logger";
import aws from "@vernglobe/aws";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { CommentType } from "./custom-type";

const logger = new Logger("comments-processor");
const commentsTbl = process.env.DYNAMODB_COMMENTS_TABLE;
const DYNAMODB_DOC_CLIENT = "DynamoDB.DocumentClient";

type PathParametersType = {
  user_id: string;
  comment_id?: number;
};

const validateRequestParams = (event: APIGatewayEvent): any => {
  const { pathParameters, body, httpMethod } = event;

  const requestBody = body ? JSON.parse(body) : null;
  const statusCode = 200;
  const response: any = {
    statusCode,
    body,
  };

  if (pathParameters?.user_id === undefined) {
    response.statusCode = 400;
    response.body = "Please specify the value for path parameter {user_id}.";
    return response;
  }

  if (httpMethod === "DELETE" && pathParameters.comment_id === undefined) {
    response.statusCode = 400;
    response.body = "Please specify the value for path parameter {comment_id}.";
    return response;
  }

  if (httpMethod === "POST") {
    if (
      (pathParameters.comment_id !== undefined &&
        (requestBody === null ||
          requestBody.content === undefined ||
          requestBody.score === undefined ||
          requestBody.replies === undefined)) ||
      (pathParameters.comment_id === undefined &&
        requestBody.newComment === undefined)
    ) {
      response.statusCode = 400;
      response.body = "Please specify check the parameter and body content.";
      return response;
    }
    response.content = requestBody.content;
    response.score = requestBody.score;
    response.replies = requestBody.replies;
    response.newComment = requestBody.newComment;
  }

  response.pathParameters = pathParameters;
  return response;
};

const formatComments = (commentList: any): any => {
  logger.debug({ commentList });
  const { Items, Count } = commentList;
  if (Count <= 0) {
    return "Content empty.";
  }
  const currentUser = {
    image: Items[0].image,
    username: Items[0].username,
  };
  Items.forEach((item: any) => {
    if (item.replies !== undefined || item.replies !== "[]") {
      // eslint-disable-next-line no-param-reassign
      item.replies = JSON.parse(item.replies);
    }
    // eslint-disable-next-line no-param-reassign
    delete item.username;
    // eslint-disable-next-line no-param-reassign
    delete item.image;
  });

  return {
    currentUser,
    comments: Items,
  };
};

const getAllComments = async (userId: string): Promise<string> => {
  try {
    const commentList = await aws(DYNAMODB_DOC_CLIENT, "query", {
      TableName: commentsTbl,
      KeyConditionExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": `${userId}`,
      },
      Limit: 1000,
    });
    return formatComments(commentList);
  } catch (err) {
    logger.error({ err });
    return Promise.reject(err);
  }
};

const updateComments = async (
  userId: string,
  id: number,
  content: string,
  score: number,
  replies: Array<CommentType>
): Promise<string> => {
  const isUpdated = false;
  try {
    const resp = await aws(DYNAMODB_DOC_CLIENT, "update", {
      TableName: commentsTbl,
      Key: {
        username: userId,
        id: Number(id),
      },
      UpdateExpression:
        "set content = :content, replies = :replies, score = :score",
      ConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":content": `${content}`,
        ":replies": `${JSON.stringify(replies)}`,
        ":score": Number(score),
        ":id": Number(id),
      },
    });
    logger.debug({ resp });
    return "Update successfully!";
  } catch (err) {
    logger.error({ err });
    return "Update failed!";
  }
};

const addComment = async (newComment: any): Promise<string> => {
  const replyString = JSON.stringify(newComment.replies);
  // eslint-disable-next-line no-param-reassign
  delete newComment.replies;
  // eslint-disable-next-line no-param-reassign
  newComment.replies = replyString;
  try {
    const commentList = await aws(DYNAMODB_DOC_CLIENT, "put", {
      TableName: commentsTbl,
      Item: newComment,
    });
    return "Add successfully!";
  } catch (err) {
    logger.error({ err });
    return "Add failed!";
  }
};

const deleteComment = async (userId: string, id: number): Promise<string> => {
  try {
    const commentList = await aws(DYNAMODB_DOC_CLIENT, "delete", {
      TableName: commentsTbl,
      Key: {
        username: userId,
        id: Number(id),
      },
    });
    return "Delete successully!.";
  } catch (err) {
    logger.error({ err });
    return "Delete failed!";
  }
};

const getCommentById = async (userId: string, id: number): Promise<string> => {
  try {
    const commentList = await aws(DYNAMODB_DOC_CLIENT, "query", {
      TableName: commentsTbl,
      KeyConditionExpression: "username = :username and id = :id",
      ExpressionAttributeValues: {
        ":username": `${userId}`,
        ":id": Number(id),
      },
      Limit: 1000,
    });
    return formatComments(commentList);
  } catch (err) {
    logger.error({ err });
    return Promise.reject(err);
  }
};

const retrieveComments = async (param: PathParametersType) => {
  let resp = null;
  if (param.user_id !== undefined) {
    if (param.comment_id !== undefined) {
      resp = await getCommentById(param.user_id, param.comment_id);
    } else {
      resp = await getAllComments(param.user_id);
    }
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

  const { user_id: userId, comment_id: id } = validateReq.pathParameters;
  const { content, score, replies, newComment } = validateReq;
  try {
    switch (event.httpMethod) {
      case "GET":
        body = await retrieveComments(validateReq.pathParameters);
        break;
      case "POST":
        if (id !== undefined) {
          body = await updateComments(userId, id, content, score, replies);
        } else {
          body = await addComment(newComment);
        }
        break;
      case "DELETE":
        body = await deleteComment(userId, id);
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

export { formatComments, validateRequestParams };
