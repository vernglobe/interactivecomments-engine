import Logger from "@vernglobe/logger";
import aws from "@vernglobe/aws";
import formatComments from "../utilities/formatter";

const logger = new Logger("comments-processor");
const commentsTbl = process.env.DYNAMODB_COMMENTS_TABLE;
const DYNAMODB_DOC_CLIENT = "DynamoDB.DocumentClient";

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
    await aws(DYNAMODB_DOC_CLIENT, "put", {
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
    await aws(DYNAMODB_DOC_CLIENT, "delete", {
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
    const { Items, Count } = items;
    if (Count > 0) {
      commentList.push(Items[0]);
      const replies = await getRepliesByParentId(id);
      if (replies.length > 0) {
        commentList.push(...replies);
      }
    }

    return formatComments(commentList);
  } catch (err) {
    logger.error({ err });
    return Promise.reject(err);
  }
};

export {
  getAllComments,
  getCommentById,
  addComment,
  updateComments,
  deleteComment,
};
