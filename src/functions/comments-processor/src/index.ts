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

const formatComments = (commentList: Array<any>): any => {
  logger.debug({ commentList });
  if (commentList.length <= 0) {
    return "Content empty.";
  }

  const parentComment = commentList.filter(
    (comment) => comment.parentId === undefined
  );

  // eslint-disable-next-line array-callback-return
  parentComment.map((parent) => {
    // eslint-disable-next-line no-param-reassign
    parent.replies = commentList.filter(
      (comment) => comment.parentId === parent.id
    );
  });

  logger.debug({ parentComment });
  return parentComment;
};

const getAllComments = async (): Promise<string> => {
  try {
    const scanResults: any = [];
    let items;
    do {
      // eslint-disable-next-line no-await-in-loop
      items = await aws(DYNAMODB_DOC_CLIENT, "scan", {
        TableName: commentsTbl,
      });
      items.Items.forEach((item: any) => scanResults.push(item));
    } while (typeof items.LastEvaluatedKey !== "undefined");

    return formatComments(scanResults);
  } catch (err) {
    logger.error({ err });
    return Promise.reject(err);
  }
};

const updateComments = async (
  id: number,
  parentId: number,
  content: string,
  score: number
): Promise<string> => {
  let conditionExpr = "id = :id";
  let exprAttrValues: any = {
    ":content": `${content}`,
    ":score": Number(score),
    ":id": Number(id),
  };

  if (parentId !== undefined) {
    conditionExpr = "id = :id and parentId = :parentId";
    exprAttrValues = {
      ":content": `${content}`,
      ":score": Number(score),
      ":id": Number(id),
      ":parentId": Number(parentId),
    };
  }

  try {
    const resp = await aws(DYNAMODB_DOC_CLIENT, "update", {
      TableName: commentsTbl,
      Key: {
        id: Number(id),
      },
      UpdateExpression: "set content = :content, score = :score",
      ConditionExpression: "id = :id",
      ExpressionAttributeValues: exprAttrValues,
    });
    logger.debug({ resp });
    return "Update successfully!";
  } catch (err) {
    logger.error({ err });
    return "Update failed!";
  }
};

const addComment = async (
  newComment: any,
  parentId: number | undefined
): Promise<string> => {
  if (parentId) {
    // eslint-disable-next-line no-param-reassign
    newComment.parentId = parentId;
  }

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

const deleteComment = async (id: number): Promise<string> => {
  try {
    const commentList = await aws(DYNAMODB_DOC_CLIENT, "delete", {
      TableName: commentsTbl,
      Key: {
        id: Number(id),
      },
    });
    return "Delete successully!.";
  } catch (err) {
    logger.error({ err });
    return "Delete failed!";
  }
};

const getRepliesByParentId = async (parentId: number): Promise<string> => {
  try {
    logger.debug("getRepliesByParentId");
    const replies: any = [];
    const parameters: any = {
      TableName: commentsTbl,
      IndexName: "replyto-parent-index",
      KeyConditionExpression: "parentId = :parentId",
      ExpressionAttributeValues: {
        ":parentId": Number(parentId),
      },
    };

    let data: any = { LastEvaluatedKey: true };
    while (typeof data.LastEvaluatedKey !== "undefined") {
      // eslint-disable-next-line no-await-in-loop
      data = await aws(DYNAMODB_DOC_CLIENT, "query", parameters);
      logger.debug({ data });
      if (
        data === undefined ||
        data?.Items === undefined ||
        data?.Items.length === 0
      ) {
        break;
      }
      parameters.ExclusiveStartKey = data.LastEvaluatedKey;
      replies.push(...data.Items);
    }

    logger.debug({ replies });

    return replies;
  } catch (err) {
    console.log({ err });
    logger.error({ err });
    return Promise.reject(err);
  }
};

const getCommentById = async (id: number): Promise<string> => {
  try {
    const commentList: any = [];
    const items = await aws(DYNAMODB_DOC_CLIENT, "query", {
      TableName: commentsTbl,
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": Number(id),
      },
      Limit: 1000,
    });
    logger.debug({ items });
    const [Items, Count] = items;
    logger.debug(`getcomment by id count:${Count}`);
    if (Count > 0) {
      const parentComment = Items[0];
      const replies = await getRepliesByParentId(id);
      if (replies.length > 0) {
        parentComment.replies = replies;
      }
      commentList.push(parentComment);
    }

    return formatComments(commentList);
  } catch (err) {
    logger.error({ err });
    return Promise.reject(err);
  }
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

export { formatComments, validateRequestParams };
