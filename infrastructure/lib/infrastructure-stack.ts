import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as path from 'path';
import { LambdaDestination } from 'aws-cdk-lib/aws-lambda-destinations';
require('dotenv').config()

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create bucket to store training data
    const bucketTrainingData = new s3.Bucket(this,'TrainingData')
    
    const myDependenciesLayer = new lambda.LayerVersion(this, 'DependencyLayer',{
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/dependencies')),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_8],
    })

    // Setup Lambda function - Features
    const featuresFunction = new lambda.Function(this, 'FeaturesHandler', {
      functionName: 'FeaturesHandler',
      runtime: lambda.Runtime.PYTHON_3_8, 
      handler: 'handler.handle',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/features')),
      layers: [myDependenciesLayer],      
      timeout: cdk.Duration.seconds(900),
      memorySize: 512,
      environment:{
        BUCKET_NAME: bucketTrainingData.bucketName
      }
    })

    // Setup Lambda function - ETL
    const etlFunction = new lambda.Function(this, 'ETLHandler', {
      functionName: 'ETLHandler',
      runtime: lambda.Runtime.PYTHON_3_8, 
      handler: 'handler.handle',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/etl')),
      layers: [myDependenciesLayer],      
      timeout: cdk.Duration.seconds(900),
      memorySize: 512,
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

    // Setup sagemaker training
    const bucketTrainingScript = new s3.Bucket(this, 'TrainingScript', {
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    const bucketTrainingOutput = new s3.Bucket(this, 'TrainingOutput', {
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    new s3deploy.BucketDeployment(this, 'DeployTrainingScript', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../training-script'))],
      destinationBucket: bucketTrainingScript
    })

    const sagemakerRole = new iam.Role(this, 'sageMakerRole', {
      assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com')
    });

    sagemakerRole.addToPolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
        'logs:DescribeLogStreams',
        "cloudwatch:PutMetricData",
        "cloudwatch:GetMetricData",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics",
      ],
    }));

    bucketTrainingData.grantRead(sagemakerRole)
    bucketTrainingScript.grantRead(sagemakerRole)
    bucketTrainingOutput.grantReadWrite(sagemakerRole)    

    const trainingFunction = new lambda.Function(this, 'TrainingHandler', {
      functionName: 'TrainingHandler',
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'handler.handle',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/training')),
      environment:{
        TRAINING_DATA_BUCKET_NAME: bucketTrainingData.bucketName,
        TRAINING_SCRIPT_BUCKET_NAME: bucketTrainingScript.bucketName,
        TRAINING_OUTPUT_BUCKET_NAME: bucketTrainingOutput.bucketName,
        SAGEMAKRR_ROLE_ARN: sagemakerRole.roleArn
      }
    });
    
    trainingFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['sagemaker:CreateTrainingJob'],
      resources: ['*'],
    })); 
    trainingFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['iam:PassRole'],
      resources: [sagemakerRole.roleArn],
    })); 
  }
}
