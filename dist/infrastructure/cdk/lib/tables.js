"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-vars */
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
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
const stack_1 = __importDefault(require("../shared/stack"));
class DynamoTables extends stack_1.default {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { ENVIRONMENT } = props || process.env;
        // const ACCOUNT = ENVIRONMENT === "prod" ? ENVIRONMENT : "preprod";
        const tablesProperties = [
            {
                logicalId: "vernForeverProductTable",
                tableProps: {
                    tableName: `vernforever-${ENVIRONMENT}-product`,
                    partitionKey: { name: "id", type: aws_dynamodb_1.AttributeType.STRING },
                    sortKey: { name: "productDt", type: aws_dynamodb_1.AttributeType.NUMBER },
                    billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST,
                },
            },
            {
                logicalId: "vernForeverMembershipTable",
                tableProps: {
                    tableName: `vernforever-${ENVIRONMENT}-membership`,
                    partitionKey: { name: "id", type: aws_dynamodb_1.AttributeType.STRING },
                    sortKey: { name: "registerDt", type: aws_dynamodb_1.AttributeType.NUMBER },
                    billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST,
                },
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
        tablesProperties.forEach(({ logicalId, tableProps }) => {
            const table = new aws_dynamodb_1.Table(this, logicalId, tableProps);
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
        });
    }
}
exports.default = DynamoTables;
