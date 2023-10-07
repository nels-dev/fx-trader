import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as s3 from 'aws-cdk-lib/aws-s3'
import path = require('path');
import { LambdaDestination } from 'aws-cdk-lib/aws-lambda-destinations';
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

    // Setup Lambda function - Features
    const featuresFunction = new lambda.Function(this, 'FeaturesHandler', {
      functionName: 'FeaturesHandler',
      runtime: lambda.Runtime.PYTHON_3_11, 
      handler: 'handler.handle',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/features')),
      layers: [myDependenciesLayer, awsPandasLayer],      
      timeout: cdk.Duration.seconds(900),
      environment:{
        BUCKET_NAME: bucketTrainingData.bucketName
      }
    })

    // Setup Lambda function - ETL
    const etlFunction = new lambda.Function(this, 'ETLHandler', {
      functionName: 'ETLHandler',
      runtime: lambda.Runtime.PYTHON_3_11, 
      handler: 'handler.handle',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/etl')),
      layers: [myDependenciesLayer, awsPandasLayer],      
      timeout: cdk.Duration.seconds(900),
      environment:{
        BUCKET_NAME: bucketTrainingData.bucketName,
        NASDAQ_API_KEY: process.env.NASDAQ_API_KEY || 'None'
      },
      onSuccess: new LambdaDestination(featuresFunction)
    })

    

    bucketTrainingData.grantReadWrite(etlFunction)
    bucketTrainingData.grantReadWrite(featuresFunction)

    const fetchDailyRule = new events.Rule(this, 'FetchDailyRule', {
      schedule: events.Schedule.cron({hour: '0', minute:'15', }, )
    })

    fetchDailyRule.addTarget(new targets.LambdaFunction(etlFunction))
  }
}
