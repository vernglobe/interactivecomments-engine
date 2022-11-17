import { Stack as SuperStack, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as merge from "deepmerge";

export default class Stack extends SuperStack {
  context: any;

  constructor(scope: Construct, id: string, props: any) {
    super(scope, id, props);
    let { ENVIRONMENT = "stage" } = props || props.env;
    if (!["stage", "prod"].includes(ENVIRONMENT)) {
      ENVIRONMENT = "stage";
    }

    const contextNames = [
      ENVIRONMENT,
      "shared",
      `stack:${id}`,
      ...(props ? props.contexts || [] : []),
    ];
    const context = contextNames.reduce((prev, contextName) => {
      const {
        accountContext,
        environmentContext,
        regionContext,
        ...restContext
      } = this.node.tryGetContext(contextName) || {};

      const thisAccountContext = accountContext && accountContext[this.account];

      const thisRegionContext = regionContext && regionContext[this.region];
      const thisEnvironmentContext =
        environmentContext && environmentContext[ENVIRONMENT];

      const merged = merge.all([
        prev,
        { ...restContext },
        { ...thisAccountContext },
        { ...thisRegionContext },
        { ...thisEnvironmentContext },
      ]);

      return merged;
    }, {});

    Object.keys(context.tags || {}).forEach((tagName) => {
      const tagValue = context.tags[tagName];
      Tags.of(this).add(tagName, tagValue);
    });

    this.context = context;
  }
}
