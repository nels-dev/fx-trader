import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as sagemaker from 'aws-cdk-lib/aws-sagemaker'
import * as path from 'path';
import { LambdaDestination } from 'aws-cdk-lib/aws-lambda-destinations';
import { SageMakerUpdateEndpoint } from 'aws-cdk-lib/aws-stepfunctions-tasks';
require('dotenv').config()

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create Sagemaker role
    const sagemakerRole = this.createSagemakerRole();
    // Create S3 buckets to store training data, script and output
    const { bucketTrainingData, bucketTrainingScript, bucketTrainingOutput } = this.setupBuckets();
    
    // Common dependency layer for lambda
    const myDependenciesLayer = new lambda.LayerVersion(this, 'DependencyLayer',{
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/dependencies')),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_8],
    })

    // Setup prediction function
    const predictFunction = this.setupPredictionFunction(sagemakerRole, myDependenciesLayer, bucketTrainingData);

    // add lambda functions for data ETL and feature extraction
    this.setupDataPreparationFunctions(bucketTrainingData, myDependenciesLayer, predictFunction);   

    // add scripts to s3 bucket
    new s3deploy.BucketDeployment(this, 'DeployTrainingScript', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../training-script'))],
      destinationBucket: bucketTrainingScript
    })

    

    // bucket permission grant
    bucketTrainingData.grantRead(sagemakerRole)
    bucketTrainingScript.grantRead(sagemakerRole)
    bucketTrainingOutput.grantReadWrite(sagemakerRole)    

    // add lambda functions for model training (Random Forest & LSTM)
    this.setupRandomForestTrainingFunction(bucketTrainingData, bucketTrainingScript, bucketTrainingOutput, sagemakerRole); 

    this.setupLstmTrainingFunction(bucketTrainingData, bucketTrainingScript, bucketTrainingOutput, sagemakerRole); 

    

    // Export variables for use in other stacks
    new cdk.CfnOutput(this, 'SagemakerRoleArn', {
      value: sagemakerRole.roleArn,
      exportName: 'SagemakerRoleArn'
    })

    new cdk.CfnOutput(this, 'ModelOutputBucket', {
      value: bucketTrainingOutput.bucketDomainName,
      exportName: 'ModelOutputBucket'
    })
    
  }

  private createSagemakerRole() {
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
        "ecr:*",
      ],
    }));
    return sagemakerRole;
  }

  private setupBuckets() {
    const bucketTrainingData = new s3.Bucket(this, 'TrainingData');

    // Setup sagemaker training
    const bucketTrainingScript = new s3.Bucket(this, 'TrainingScript', {
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const bucketTrainingOutput = new s3.Bucket(this, 'TrainingOutput', {
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    return { bucketTrainingData, bucketTrainingScript, bucketTrainingOutput };
  }

  private setupDataPreparationFunctions(bucketTrainingData: cdk.aws_s3.Bucket, myDependenciesLayer: lambda.ILayerVersion, predictFunction: lambda.Function) {
    

    const featuresFunction = new lambda.Function(this, 'FeaturesHandler', {
      functionName: 'FeaturesHandler',
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'handler.handle',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/features')),
      layers: [myDependenciesLayer],
      timeout: cdk.Duration.seconds(900),
      memorySize: 512,
      environment: {
        BUCKET_NAME: bucketTrainingData.bucketName
      },
      onSuccess: new LambdaDestination(predictFunction)
    });

    // Setup Lambda function - ETL
    const etlFunction = new lambda.Function(this, 'ETLHandler', {
      functionName: 'ETLHandler',
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'handler.handle',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/etl')),
      layers: [myDependenciesLayer],
      timeout: cdk.Duration.seconds(900),
      memorySize: 512,
      environment: {
        BUCKET_NAME: bucketTrainingData.bucketName,
        NASDAQ_API_KEY: process.env.NASDAQ_API_KEY || 'None'
      },
      onSuccess: new LambdaDestination(featuresFunction)
    });



    bucketTrainingData.grantReadWrite(etlFunction);
    bucketTrainingData.grantReadWrite(featuresFunction);

    const fetchDailyRule = new events.Rule(this, 'FetchDailyRule', {
      schedule: events.Schedule.cron({ hour: '0', minute: '15', })
    });

    fetchDailyRule.addTarget(new targets.LambdaFunction(etlFunction));
  }

  private setupRandomForestTrainingFunction(bucketTrainingData: cdk.aws_s3.Bucket, bucketTrainingScript: cdk.aws_s3.Bucket, bucketTrainingOutput: cdk.aws_s3.Bucket, sagemakerRole: cdk.aws_iam.Role) {
    const rfTrainingFunction = new lambda.Function(this, 'RF_TrainingHandler', {
      functionName: 'RF_TrainingHandler',
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'train_rf.handle',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/training')),
      timeout: cdk.Duration.seconds(900),
      environment: {
        TRAINING_DATA_BUCKET_NAME: bucketTrainingData.bucketName,
        TRAINING_SCRIPT_BUCKET_NAME: bucketTrainingScript.bucketName,
        TRAINING_OUTPUT_BUCKET_NAME: bucketTrainingOutput.bucketName,
        SAGEMAKRR_ROLE_ARN: sagemakerRole.roleArn
      }
    });

    rfTrainingFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['sagemaker:CreateTrainingJob'],
      resources: ['*'],
    }));
    rfTrainingFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['iam:PassRole'],
      resources: [sagemakerRole.roleArn],
    }));
  }

  private setupLstmTrainingFunction(bucketTrainingData: cdk.aws_s3.Bucket, bucketTrainingScript: cdk.aws_s3.Bucket, bucketTrainingOutput: cdk.aws_s3.Bucket, sagemakerRole: cdk.aws_iam.Role) {
    const lstmTrainingFunction = new lambda.Function(this, 'LSTM_TrainingHandler', {
      functionName: 'LSTM_TrainingHandler',
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'train_lstm.handle',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/training')),
      timeout: cdk.Duration.seconds(900),
      environment: {
        TRAINING_DATA_BUCKET_NAME: bucketTrainingData.bucketName,
        TRAINING_SCRIPT_BUCKET_NAME: bucketTrainingScript.bucketName,
        TRAINING_OUTPUT_BUCKET_NAME: bucketTrainingOutput.bucketName,
        SAGEMAKRR_ROLE_ARN: sagemakerRole.roleArn
      }
    });

    lstmTrainingFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['sagemaker:CreateTrainingJob', 'sagemaker:CreateHyperParameterTuningJob'],
      resources: ['*'],
    }));
    lstmTrainingFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['iam:PassRole'],
      resources: [sagemakerRole.roleArn],
    }));
  }

  private setupPredictionFunction(sagemakerRole: cdk.aws_iam.Role, myDependenciesLayer: lambda.ILayerVersion, 
    bucketTrainingData: cdk.aws_s3.Bucket) {
    const predictFunction = new lambda.Function(this, 'PredictionHandler', {
      functionName: 'PredictionHandler',
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'handler.handle',
      layers: [myDependenciesLayer],
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-functions/predict')),
      memorySize: 512,
      timeout: cdk.Duration.seconds(900),
      environment: {        
        SAGEMAKRR_ROLE_ARN: sagemakerRole.roleArn,
        BUCKET_NAME: bucketTrainingData.bucketName,
        MONGO_HOST: 'main.0k9qtgy.mongodb.net',
        MONGO_USERNAME: 'fx-trader-app-user',
        MONGO_PASSWORD: process.env.MONGO_PASSWORD || 'None',
        MONGO_DB_NAME: 'main'
      }
    });

    predictFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['sagemaker:*'],
      resources: ['*'],
    }));
    predictFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['iam:PassRole'],
      resources: [sagemakerRole.roleArn],
    }));
    bucketTrainingData.grantRead(predictFunction);
    return predictFunction
  }
}
