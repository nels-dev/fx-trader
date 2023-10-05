import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets'

import path = require('path');

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Setup Lambda function - Fetch
    const fetchDataFunction = new lambda.Function(this, 'FetchDataFunction', {
      runtime: lambda.Runtime.PYTHON_3_11, 
      handler: 'handler.handle',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/fetch'))
    })

    const fetchDailyRule = new events.Rule(this, 'FetchDailyRule', {
      schedule: events.Schedule.cron({hour: '12', minute:'0'})
    })

    fetchDailyRule.addTarget(new targets.LambdaFunction(fetchDataFunction))
  }
}
