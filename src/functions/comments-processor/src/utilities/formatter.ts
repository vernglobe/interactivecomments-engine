import Logger from "@vernglobe/logger";

const logger = new Logger("formatter");

export default function formatComments(commentList: Array<any>): any {
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
}
