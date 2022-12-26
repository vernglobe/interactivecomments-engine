/* eslint-disable no-unused-vars */
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import Stack from "../shared/stack";

export default class DynamoTables extends Stack {
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id, props);
    const { ENVIRONMENT } = props || process.env;
    const tablesProperties = [
      {
        logicalId: "interactiveCommentsTable",
        tableProps: {
          tableName: `interactivecomments-${ENVIRONMENT}`,
          partitionKey: { name: "id", type: AttributeType.NUMBER },
          billingMode: BillingMode.PAY_PER_REQUEST,
        },
        globalSecondaryIndexList: [
          {
            indexName: "replyto-parent-index",
            partitionKey: { name: "parentId", type: AttributeType.NUMBER },
          },
        ],
      },
    ];
    tablesProperties.forEach(
      ({ logicalId, tableProps, globalSecondaryIndexList = [] }) => {
        const table = new Table(this, logicalId, tableProps);
        globalSecondaryIndexList.forEach((index) => {
          table.addGlobalSecondaryIndex(index);
        });
      }
    );
  }
}
