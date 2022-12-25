process.env.DYNAMODB_COMMENTS_TABLE = "commentstable";

describe("test comments procesor", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const commentData = [
    {
      content: "merry christmas",
      commentId: 2,
      image: {
        png: "./images/avatars/yoda.png",
      },
      createdAt: "2022-05-14T13:49:51.141Z",
      score: 5,
      user: {
        image: {
          png: "./images/avatars/lukeskywalker.png",
        },
        username: "lukeskywalker",
      },
      replies: [
        {
          createdAt: "2022-06-01T13:49:51.141Z",
          score: 4,
          id: 3,
          replyingTo: "lukeskywalker",
          user: {
            image: {
              png: "./images/avatars/vader.png",
            },
            username: "vader",
          },
          content: "me here",
        },
        {
          createdAt: "2022-06-02T13:49:51.141Z",
          score: 2,
          id: 4,
          replyingTo: "vader",
          user: {
            image: {
              png: "./images/avatars/yoda.png",
            },
            username: "yoda",
          },
          content: "yes i am",
        },
      ],
      username: "yoda",
    },
  ];

  const commentList = {
    Items: commentData,
    Count: 1,
  };

  test("get all comments by /{user_id} success", async () => {
    commentList.Items.forEach((comment: any) => {
      if (comment.replies !== undefined) {
        // eslint-disable-next-line no-param-reassign
        comment.replies = JSON.stringify(comment);
      }
    });

    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments/{user_id}",
      path: "/comments/yoda",
      httpMethod: "GET",
      pathParameters: {
        user_id: "yoda",
      },
    };
    const resp = await handler(event);
    const { statusCode } = resp;

    expect(statusCode).toEqual(200);
  });

  test("get all comments without /{user_id} fail", async () => {
    commentList.Items.forEach((comment: any) => {
      if (comment.replies !== undefined) {
        // eslint-disable-next-line no-param-reassign
        comment.replies = JSON.stringify(comment);
      }
    });

    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments/{user_id}",
      path: "/comments/yoda",
      httpMethod: "GET",
      pathParameters: {},
    };
    const resp = await handler(event);
    const { statusCode } = resp;

    expect(statusCode).toEqual(400);
  });

  test("delete comment by /{user_id}/{comment_id} success", async () => {
    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments/{user_id}",
      path: "/comments/yoda",
      httpMethod: "DELETE",
      pathParameters: {
        user_id: "yoda",
        comment_id: 1,
      },
    };
    const resp = await handler(event);
    const { statusCode } = resp;

    expect(statusCode).toEqual(200);
  });

  test("delete comment without /{comment_id} fail", async () => {
    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments/{user_id}",
      path: "/comments/yoda",
      httpMethod: "DELETE",
      pathParameters: {
        user_id: "yoda",
      },
    };
    const resp = await handler(event);
    const { statusCode } = resp;

    expect(statusCode).toEqual(400);
  });

  test("delete comment without /{user_id}/{comment_id} fail", async () => {
    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments/{user_id}",
      path: "/comments/yoda",
      httpMethod: "DELETE",
      pathParameters: null,
    };
    const resp = await handler(event);
    const { statusCode } = resp;

    expect(statusCode).toEqual(400);
  });

  test("update comment by /{user_id}/{comment_id} success", async () => {
    commentList.Items.forEach((comment: any) => {
      if (comment.replies !== undefined) {
        // eslint-disable-next-line no-param-reassign
        comment.replies = JSON.stringify(comment);
      }
    });

    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments/{user_id}",
      path: "/comments/yoda",
      httpMethod: "POST",
      pathParameters: {
        user_id: "yoda",
        comment_id: 5,
      },
      body: JSON.stringify({
        content: {},
        score: 0,
        replies: [],
      }),
    };
    const resp = await handler(event);
    const { statusCode } = resp;
    expect(statusCode).toEqual(200);
  });

  test("update comment without /{user_id}/{comment_id} fail", async () => {
    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments/{user_id}",
      path: "/comments/yoda",
      httpMethod: "POST",
      pathParameters: null,
      body: JSON.stringify({
        content: {},
        score: 0,
        replies: [],
      }),
    };
    const resp = await handler(event);
    const { statusCode } = resp;
    expect(statusCode).toEqual(400);
  });

  test("update comment by /{user_id}/{comment_id} and without body content fail", async () => {
    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments/{user_id}",
      path: "/comments/yoda",
      httpMethod: "POST",
      pathParameters: {
        user_id: "yoda",
        comment_id: 90,
      },
      body: JSON.stringify({
        score: 0,
        replies: [],
      }),
    };
    const resp = await handler(event);
    const { statusCode } = resp;
    expect(statusCode).toEqual(400);
  });

  test("add comment by /{user_id} success", async () => {
    commentList.Items.forEach((comment: any) => {
      if (comment.replies !== undefined) {
        // eslint-disable-next-line no-param-reassign
        comment.replies = JSON.stringify(comment);
      }
    });

    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments/{user_id}",
      path: "/comments/yoda",
      httpMethod: "POST",
      pathParameters: {
        user_id: "yoda",
      },
      body: JSON.stringify({
        newComment: {},
      }),
    };
    const resp = await handler(event);
    const { statusCode } = resp;
    expect(statusCode).toEqual(200);
  });

  test("add comment without /{user_id} fail", async () => {
    commentList.Items.forEach((comment: any) => {
      if (comment.replies !== undefined) {
        // eslint-disable-next-line no-param-reassign
        comment.replies = JSON.stringify(comment);
      }
    });

    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments/{user_id}",
      path: "/comments/yoda",
      httpMethod: "POST",
      pathParameters: {},
      body: JSON.stringify({
        newComment: {},
      }),
    };
    const resp = await handler(event);
    const { statusCode } = resp;
    expect(statusCode).toEqual(400);
  });

  test("get comment by /{user_id}/{comment_id} success", async () => {
    commentList.Items.forEach((comment: any) => {
      if (comment.replies !== undefined) {
        // eslint-disable-next-line no-param-reassign
        comment.replies = JSON.stringify(comment);
      }
    });

    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);

    const { handler } = require("../index");
    const event = {
      resource: "/comments/{user_id}/{comment_id}",
      path: "/comments/yoda/4",
      httpMethod: "GET",
      pathParameters: {
        user_id: "siti",
        comment_id: 4,
      },
    };
    const resp = await handler(event);
    const { statusCode } = resp;

    expect(statusCode).toEqual(200);
  });

  test("format comment as expected.", async () => {
    const { formatComments } = require("../index");
    commentList.Items.forEach((comment: any) => {
      if (comment.replies !== undefined) {
        // eslint-disable-next-line no-param-reassign
        comment.replies = JSON.stringify(comment);
      }
    });
    const resp = await formatComments(commentList);
    expect(resp).toEqual({
      currentUser: {
        image: commentData[0].image,
        username: commentData[0].username,
      },
      comments: commentData,
    });
  });
});
