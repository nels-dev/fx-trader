import boto3
import os
from datetime import datetime
def handle(event, context):    
    formatted_timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    client = boto3.client('sagemaker')
    training_data_bucket_name = os.environ['TRAINING_DATA_BUCKET_NAME']
    training_script_bucket_name = os.environ['TRAINING_SCRIPT_BUCKET_NAME']
    training_output_bucket_name = os.environ['TRAINING_OUTPUT_BUCKET_NAME']
    sagemaker_role_arn = os.environ['SAGEMAKRR_ROLE_ARN']
    
    training_data_uri = f"s3://{training_data_bucket_name}/"
    training_script_uri = f"s3://{training_script_bucket_name}/"
    training_output_uri = f"s3://{training_output_bucket_name}/"
    training_job_name = f"random-forest-train-{formatted_timestamp}"

    
    training_job_config = {
        "TrainingJobName": training_job_name,
        "AlgorithmSpecification": {
            "TrainingInputMode": "File",
            "TrainingImage" : '246618743249.dkr.ecr.us-west-2.amazonaws.com/sagemaker-scikit-learn:0.23-1-cpu-py3'            
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
            "sagemaker_program": "random_forest_train.py",
            "sagemaker_submit_directory": training_script_uri
        },
        "StoppingCondition": {
            "MaxRuntimeInSeconds": 3600
        },
        
    }

    client.create_training_job(**training_job_config)
    
    return 'Job started'