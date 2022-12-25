process.env.DYNAMODB_COMMENTS_TABLE = "commentstable";

describe("test comments procesor", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const mockEventUser = {
    resource: "/comments/{user_id}",
    path: "/comments/yoda",
    httpMethod: "GET",
    headers: {
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      "CloudFront-Forwarded-Proto": "https",
      "CloudFront-Is-Desktop-Viewer": "true",
      "CloudFront-Is-Mobile-Viewer": "false",
      "CloudFront-Is-SmartTV-Viewer": "false",
      "CloudFront-Is-Tablet-Viewer": "false",
      "CloudFront-Viewer-ASN": "14618",
      "CloudFront-Viewer-Country": "US",
      Host: "pkg1tglr84.execute-api.ap-southeast-2.amazonaws.com",
      "Postman-Token": "f2f9c7b4-03d6-49e0-949b-f934d3aef0e7",
      "User-Agent": "PostmanRuntime/7.30.0",
      Via: "1.1 5e1f849553b1d58615d0d8f7c044078e.cloudfront.net (CloudFront)",
      "X-Amz-Cf-Id": "4OpAz-YLIB0rKNNjEkrtg3PBso7eMc0Wlcyf_wAB_v_dQ38AwcOxhg==",
      "X-Amzn-Trace-Id": "Root=1-63a79fc6-29c5989357c7c14a4893d854",
      "X-Api-Key": "tdIp2XRxCd8oLH9a5dIip5AzQ2BgrgQl8u1I9F5x",
      "X-Forwarded-For": "54.86.50.139, 130.176.179.9",
      "X-Forwarded-Port": "443",
      "X-Forwarded-Proto": "https",
    },
    pathParameters: {
      user_id: "yoda",
    },
    stageVariables: null,
    body: null,
    isBase64Encoded: false,
  };

  const mockEventComment = {
    resource: "/comments/{user_id}/{comment_id}",
    path: "/comments/yoda/2",
    httpMethod: "GET",
    headers: {
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      "CloudFront-Forwarded-Proto": "https",
      "CloudFront-Is-Desktop-Viewer": "true",
      "CloudFront-Is-Mobile-Viewer": "false",
      "CloudFront-Is-SmartTV-Viewer": "false",
      "CloudFront-Is-Tablet-Viewer": "false",
      "CloudFront-Viewer-ASN": "14618",
      "CloudFront-Viewer-Country": "US",
      Host: "pkg1tglr84.execute-api.ap-southeast-2.amazonaws.com",
      "Postman-Token": "f2f9c7b4-03d6-49e0-949b-f934d3aef0e7",
      "User-Agent": "PostmanRuntime/7.30.0",
      Via: "1.1 5e1f849553b1d58615d0d8f7c044078e.cloudfront.net (CloudFront)",
      "X-Amz-Cf-Id": "4OpAz-YLIB0rKNNjEkrtg3PBso7eMc0Wlcyf_wAB_v_dQ38AwcOxhg==",
      "X-Amzn-Trace-Id": "Root=1-63a79fc6-29c5989357c7c14a4893d854",
      "X-Api-Key": "tdIp2XRxCd8oLH9a5dIip5AzQ2BgrgQl8u1I9F5x",
      "X-Forwarded-For": "54.86.50.139, 130.176.179.9",
      "X-Forwarded-Port": "443",
      "X-Forwarded-Proto": "https",
    },
    pathParameters: {
      comment_id: "2",
      user_id: "yoda",
    },
    stageVariables: null,
    body: {},
    isBase64Encoded: false,
  };

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

  test("get all comments by username success", async () => {
    commentList.Items.forEach((comment: any) => {
      if (comment.replies !== undefined) {
        // eslint-disable-next-line no-param-reassign
        comment.replies = JSON.stringify(comment);
      }
    });

    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");

    const resp = await handler(mockEventUser);
    const { statusCode } = resp;

    expect(statusCode).toEqual(200);
  });

  test("delete comment by commentId success", async () => {
    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    mockEventComment.httpMethod = "DELETE";
    mockEventComment.body = JSON.stringify(mockEventComment.body);
    const resp = await handler(mockEventComment);
    const { statusCode } = resp;

    expect(statusCode).toEqual(200);
  });

  test("update comment by commentId success", async () => {
    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);
    const { handler } = require("../index");
    mockEventComment.httpMethod = "POST";
    mockEventComment.body = JSON.stringify({
      content: {},
      score: 0,
      replies: [],
    });
    const resp = await handler(mockEventComment);
    const { statusCode } = resp;
    expect(statusCode).toEqual(200);
  });

  test("get all comments by username and commentId success", async () => {
    const mockAws = jest.fn().mockResolvedValueOnce(commentList);
    jest.mock("@vernglobe/aws", () => mockAws);

    const { handler } = require("../index");

    const resp = await handler(mockEventComment);
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
