process.env.DYNAMODB_COMMENTS_TABLE = "commentstable";

describe("test comments procesor", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const commentList = [
    {
      content:
        "Woah, your project looks awesome! How long have you been coding for? I'm still new, but think I want to dive into Angular as well soon. Perhaps you can give me an insight on where I can learn Angular? Thanks!",
      createdAt: "2022-05-14T13:49:51.141Z",
      score: 9,
      user: {
        image: {
          png: "./images/avatars/lukeskywalker.png",
        },
        username: "lukeskywalker",
      },
      id: 3,
    },
    {
      content:
        "Woah, your project looks awesome! How long have you been coding for? I'm still new, but think I want to dive into Angular as well soon. Perhaps you can give me an insight on where I can learn Angular? Thanks!",
      createdAt: "2022-05-14T13:49:51.141Z",
      score: 5,
      user: {
        image: {
          png: "./images/avatars/lukeskywalker.png",
        },
        username: "lukeskywalker",
      },
      id: 2,
    },
    {
      content:
        "Chillax, my Padawans. Much to learn, you have. The fundamentals of HTML, CSS, and JS, I'd recommend focusing on. It's very tempting to jump ahead but lay a solid foundation first. Everything moves so fast and it always seems like everyone knows the newest library/framework. But the fundamentals are what stays constant.",
      replyingTo: "vader",
      createdAt: "2022-06-02T13:49:51.141Z",
      score: 2,
      user: {
        image: {
          png: "./images/avatars/yoda.png",
        },
        username: "yoda",
      },
      parentId: 2,
      id: 4,
    },
    {
      content:
        "Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You've nailed the design and the responsiveness at various breakpoints works really well.",
      createdAt: "2022-04-10T13:49:51.141Z",
      score: 12,
      user: {
        image: {
          png: "./images/avatars/leiaskywalker.png",
        },
        username: "leiaskywalker",
      },
      id: 1,
    },
  ];

  test("get all comments success", async () => {
    const mockAws = jest.fn().mockResolvedValueOnce({
      Items: commentList,
    });
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments",
      path: "/comments",
      httpMethod: "GET",
      pathParameters: {
        user_id: "yoda",
      },
    };
    const resp = await handler(event);
    const { statusCode } = resp;

    expect(statusCode).toEqual(200);
  });

  test("delete comment by /{comment_id} success", async () => {
    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments",
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
      resource: "/comments",
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

  test("delete comment without /{comment_id} fail", async () => {
    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments",
      path: "/comments/yoda",
      httpMethod: "DELETE",
      pathParameters: null,
    };
    const resp = await handler(event);
    const { statusCode } = resp;

    expect(statusCode).toEqual(400);
  });

  test("update comment by /{comment_id} success", async () => {
    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments",
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

  test("add comment by  success", async () => {
    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    const event = {
      resource: "/comments",
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

  test("get comment by /{comment_id} success", async () => {
    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);

    const { handler } = require("../index");
    const event = {
      resource: "/comments/{comment_id}",
      path: "/comments/4",
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
  /*
  test("format comment as expected.", async () => {
    const formatComments = require("../utilities/formatter");
    const resp = await formatComments(commentList);

    expect(resp.length).toEqual(3);
  }); */
});
