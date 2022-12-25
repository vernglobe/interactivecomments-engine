// import { handler } from "../index";

describe("test comments procesor", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const mockEvent = {
    event: {
      resource: "/comments/{user_id}",
      path: "/comments/yoda",
      httpMethod: "GET",
      headers: null,
      multiValueHeaders: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      pathParameters: {
        user_id: "yoda",
      },
      stageVariables: null,
      requestContext: {
        resourceId: "tktbzd",
        resourcePath: "/comments/{user_id}",
        httpMethod: "GET",
        extendedRequestId: "drSBjFYzywMFq8A=",
        requestTime: "25/Dec/2022:00:18:30 +0000",
        path: "/comments/{user_id}",
        accountId: "925746218563",
        protocol: "HTTP/1.1",
        stage: "test-invoke-stage",
        domainPrefix: "testPrefix",
        requestTimeEpoch: 1671927510575,
        requestId: "46716b96-b2a7-4e6f-b03c-caee06843a26",
        identity: {
          cognitoIdentityPoolId: null,
          cognitoIdentityId: null,
          apiKey: "test-invoke-api-key",
          principalOrgId: null,
          cognitoAuthenticationType: null,
          userArn: "arn:aws:iam::925746218563:user/vern",
          apiKeyId: "test-invoke-api-key-id",
          userAgent:
            "aws-internal/3 aws-sdk-java/1.12.358 Linux/5.4.223-137.414.amzn2int.x86_64 OpenJDK_64-Bit_Server_VM/25.352-b10 java/1.8.0_352 vendor/Oracle_Corporation cfg/retry-mode/standard",
          accountId: "925746218563",
          caller: "AIDA5PCWGIZBR6DY47BMV",
          sourceIp: "test-invoke-source-ip",
          accessKey: "ASIA5PCWGIZBYZL3QHFU",
          cognitoAuthenticationProvider: null,
          user: "AIDA5PCWGIZBR6DY47BMV",
        },
        domainName: "testPrefix.testDomainName",
        apiId: "pkg1tglr84",
      },
      body: null,
      isBase64Encoded: false,
    },
  };
  
  test("add comment success", () => {});
});
