/* eslint-disable no-unused-vars */
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
/* import { BackupPlan, BackupVault, BackupPlanRule, BackupResource } from "@aws-cdk/aws-backup";
import {
  CfnAlarm,
  TreatMissingData,
  CfnAnomalyDetector,
  ComparisonOperator,
  Statistic
} from "@aws-cdk/aws-cloudwatch";
import { Topic } from "@aws-cdk/aws-sns";
import { RemovalPolicy, Duration } from "@aws-cdk/core";
import { Schedule }  from "@aws-cdk/aws-events"; */
import Stack from "../shared/stack";

export default class DynamoTables extends Stack {
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id, props);
    const { ENVIRONMENT } = props || process.env;
    // const ACCOUNT = ENVIRONMENT === "prod" ? ENVIRONMENT : "preprod";

    const tablesProperties = [
      {
        logicalId: "vernForeverLivingTable",
        tableProps: {
          tableName: `vernforever-${ENVIRONMENT}`,
          partitionKey: { name: "id", type: AttributeType.STRING },
          billingMode: BillingMode.PAY_PER_REQUEST,
        },
        globalSecondaryIndexList: [
          {
            indexName: "categoryIndexName",
            partitionKey: { name: "category", type: AttributeType.STRING },
          },
        ],
      },
    ];
    /*
    const backupVault = new BackupVault(this, "BackupVault", {
      backupVaultName: `meme-${ENVIRONMENT}`,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const backupPlan = new BackupPlan(this, "BackupPlan", {
      backupPlanName: `meme-${ENVIRONMENT}`,
      backupVault
    });

    backupPlan.addRule(
      new BackupPlanRule({
        ruleName: "DailyTwice3DayRetention",
        scheduleExpression: Schedule.cron({
          minute: "0",
          hour: "5/12"
        }),
        deleteAfter: Duration.days(3)
      })
    );

    backupPlan.addRule(
      new BackupPlanRule({
        ruleName: "Weekly30DayRetention",
        scheduleExpression: Schedule.cron({
          minute: "0",
          hour: "5",
          weekDay: "SAT"
        }),
        deleteAfter: Duration.days(30)
      })
    );

    const cloudWatchAlarmTopic = Topic.fromTopicArn(
      this,
      `${ACCOUNT}CloudWatchAlarmTopic`,
      `arn:aws:sns:${this.region}:${this.account}:meme-${ACCOUNT}-sns-cloudWatchAlarm-topic`
    );
*/
    tablesProperties.forEach(
      ({ logicalId, tableProps, globalSecondaryIndexList = [] }) => {
        const table = new Table(this, logicalId, tableProps);
        globalSecondaryIndexList.forEach((index) => {
          table.addGlobalSecondaryIndex(index);
        });
        /*
      // Create Read Alarm
      const readAnomolyDetectorProperties = {
        metricName: "ConsumedReadCapacityUnits",
        namespace: "AWS/DynamoDB",
        stat: Statistic.AVERAGE,
        dimensions: [
          {
            name: "TableName",
            value: `${tableProps.tableName}`
          }
        ]
      };

      new CfnAnomalyDetector(
        this,
        `${tableProps.tableName}-read-units-anomaly-detector`,
        readAnomolyDetectorProperties
      );

      new CfnAlarm(this, `${tableProps.tableName}-read-units-alarm`, {
        alarmName: `${tableProps.tableName}-table-read-units-alarm`,
        alarmActions: [cloudWatchAlarmTopic.topicArn],
        comparisonOperator: ComparisonOperator.GREATER_THAN_UPPER_THRESHOLD,
        metrics: [
          {
            id: "ad1",
            expression: "ANOMALY_DETECTION_BAND(m1, 10)"
          },
          {
            id: "m1",
            metricStat: {
              period: 300,
              stat: Statistic.AVERAGE,
              metric: {
                metricName: "ConsumedReadCapacityUnits",
                namespace: "AWS/DynamoDB",
                dimensions: [
                  {
                    name: "TableName",
                    value: `${tableProps.tableName}`
                  }
                ]
              }
            }
          }
        ],
        thresholdMetricId: "ad1",
        evaluationPeriods: 5,
        datapointsToAlarm: 5,
        alarmDescription: "Alarm for anomalies in read capacity units exceeding our normal usage.",
        treatMissingData: TreatMissingData.NOT_BREACHING
      });

      // Create Write Capacity Units alarm
      const writeAnomolyDetectorProperties = {
        metricName: "ConsumedWriteCapacityUnits",
        namespace: "AWS/DynamoDB",
        stat: Statistic.AVERAGE,
        dimensions: [
          {
            name: "TableName",
            value: `${tableProps.tableName}`
          }
        ]
      };

      new CfnAnomalyDetector(
        this,
        `${tableProps.tableName}-write-units-anomaly-detector`,
        writeAnomolyDetectorProperties
      );

      new CfnAlarm(this, `${tableProps.tableName}-write-units-alarm`, {
        alarmActions: [cloudWatchAlarmTopic.topicArn],
        alarmName: `${tableProps.tableName}-table-write-units-alarm`,
        comparisonOperator: ComparisonOperator.GREATER_THAN_UPPER_THRESHOLD,
        metrics: [
          {
            id: "ad1",
            expression: "ANOMALY_DETECTION_BAND(m1, 10)"
          },
          {
            id: "m1",
            metricStat: {
              period: 300,
              stat: Statistic.AVERAGE,
              metric: {
                metricName: "ConsumedWriteCapacityUnits",
                namespace: "AWS/DynamoDB",
                dimensions: [
                  {
                    name: "TableName",
                    value: `${tableProps.tableName}`
                  }
                ]
              }
            }
          }
        ],
        thresholdMetricId: "ad1",
        evaluationPeriods: 3,
        datapointsToAlarm: 3,
        alarmDescription: "Alarm for anomalies in write capacity units exceeding our normal usage.",
        treatMissingData: TreatMissingData.NOT_BREACHING
      });

      backupPlan.addSelection(`${table}-Selection`, {
        resources: [BackupResource.fromDynamoDbTable(table)]
      }); */
      }
    );
  }
}
