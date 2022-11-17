"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_cdk_lib_1 = require("aws-cdk-lib");
const merge = __importStar(require("deepmerge"));
class Stack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
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
            const { accountContext, environmentContext, regionContext, ...restContext } = this.node.tryGetContext(contextName) || {};
            const thisAccountContext = accountContext && accountContext[this.account];
            const thisRegionContext = regionContext && regionContext[this.region];
            const thisEnvironmentContext = environmentContext && environmentContext[ENVIRONMENT];
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
            aws_cdk_lib_1.Tags.of(this).add(tagName, tagValue);
        });
        this.context = context;
    }
}
exports.default = Stack;
