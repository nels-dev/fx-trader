import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as s3 from 'aws-cdk-lib/aws-s3'
import path = require('path');
require('dotenv').config()

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create bucket to store training data
    const bucketTrainingData = new s3.Bucket(this,'TrainingData')

    const awsPandasLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'AWSPandas', 'arn:aws:lambda:us-west-2:770693421928:layer:Klayers-p311-pandas:3')
    const myDependenciesLayer = new lambda.LayerVersion(this, 'DependencyLayer',{
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/dependencies')),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_11],
    })

    // Setup Lambda function - Fetch
    const fetchDataFunction = new lambda.Function(this, 'FetchDataFunction', {
      runtime: lambda.Runtime.PYTHON_3_11, 
      handler: 'handler.handle',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/fetch')),
      layers: [myDependenciesLayer, awsPandasLayer],      
      timeout: cdk.Duration.seconds(180),
      environment:{
        BUCKET_NAME: bucketTrainingData.bucketName,
        NASDAQ_API_KEY: process.env.NASDAQ_API_KEY || 'None'
      }
    })

    bucketTrainingData.grantReadWrite(fetchDataFunction)

    const fetchDailyRule = new events.Rule(this, 'FetchDailyRule', {
      schedule: events.Schedule.cron({hour: '7', minute:'0', }, )
    })

    fetchDailyRule.addTarget(new targets.LambdaFunction(fetchDataFunction))
  }
}
