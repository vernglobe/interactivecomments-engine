// import { handler } from "../index";

describe("test comments procesor", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const mockEvent = {
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
    requestContext: {
      resourceId: "tktbzd",
      resourcePath: "/comments/{user_id}",
      httpMethod: "GET",
      extendedRequestId: "drXnAHCPSwMF0HA=",
      requestTime: "25/Dec/2022:00:56:38 +0000",
      path: "/prod/comments/yoda",
      accountId: "925746218563",
      protocol: "HTTP/1.1",
      stage: "prod",
      domainPrefix: "pkg1tglr84",
      requestTimeEpoch: 1671929798229,
      requestId: "3d502db3-6c2e-4a80-9c26-c22d5ada5b6e",
      identity: {
        cognitoIdentityPoolId: null,
        cognitoIdentityId: null,
        apiKey: "tdIp2XRxCd8oLH9a5dIip5AzQ2BgrgQl8u1I9F5x",
        principalOrgId: null,
        cognitoAuthenticationType: null,
        userArn: null,
        apiKeyId: "nvogtk2y9i",
        userAgent: "PostmanRuntime/7.30.0",
        accountId: null,
        caller: null,
        sourceIp: "54.86.50.139",
        accessKey: null,
        cognitoAuthenticationProvider: null,
        user: null,
      },
      domainName: "pkg1tglr84.execute-api.ap-southeast-2.amazonaws.com",
      apiId: "pkg1tglr84",
    },
    body: null,
    isBase64Encoded: false,
  };

  test("add comment success", () => {});
});
