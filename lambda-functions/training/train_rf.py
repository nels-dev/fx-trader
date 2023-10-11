import boto3
import os
from datetime import datetime
def handle(event, context):    
    
    currency_config = ['CAD','AUD','EUR','GBP','NZD','CHF','JPY']
    
    for currency in currency_config: 
        formatted_timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        client = boto3.client('sagemaker')
        training_data_bucket_name = os.environ['TRAINING_DATA_BUCKET_NAME']
        training_script_bucket_name = os.environ['TRAINING_SCRIPT_BUCKET_NAME']
        training_output_bucket_name = os.environ['TRAINING_OUTPUT_BUCKET_NAME']
        sagemaker_role_arn = os.environ['SAGEMAKRR_ROLE_ARN']
    
        training_data_uri = f"s3://{training_data_bucket_name}/"
        training_script_uri = f"s3://{training_script_bucket_name}/training-script.tar.gz"
        training_output_uri = f"s3://{training_output_bucket_name}/"
        training_job_name = f"random-forest-train-{currency}-{formatted_timestamp}"
        training_job_config = {
            "TrainingJobName": training_job_name,
            "AlgorithmSpecification": {
                "TrainingInputMode": "File",
                "TrainingImage" : '246618743249.dkr.ecr.us-west-2.amazonaws.com/sagemaker-scikit-learn:0.23-1-cpu-py3',
                "MetricDefinitions": [
                    {"Name": "r2_score", "Regex": "R2 Score: ([-+]?[0-9.]+).*$"},
                    {"Name": "mse", "Regex": "Mean Squared Error: ([0-9.]+).*$"},
                ],
            },
            "RoleArn": sagemaker_role_arn,
            "InputDataConfig": [
                {
                    "ChannelName": "train",
                    "DataSource": {
                        "S3DataSource": {
                            "S3DataType": "S3Prefix",
                            "S3Uri": training_data_uri,
                            "S3DataDistributionType": "FullyReplicated"
                        }
                    },
                    'ContentType': 'text/csv',
                    'CompressionType': 'None',
                }
            ],
            "OutputDataConfig": {
                "S3OutputPath": training_output_uri
            },        
            "ResourceConfig": {
                "InstanceType": "ml.m5.large",
                "InstanceCount": 1,
                "VolumeSizeInGB": 10
            },
            "HyperParameters": {            
                "n_estimators": "100",
                "max_depth": "15",
                "max_features": "auto",
                "min_samples_split": "10",
                "min_samples_leaf": "20",
                "currency": currency,
                "sagemaker_program": "random_forest_train.py",
                "sagemaker_submit_directory": training_script_uri
            },
            "StoppingCondition": {
                "MaxRuntimeInSeconds": 3600
            },
            
        }

        client.create_training_job(**training_job_config)
    
    return 'Job started'