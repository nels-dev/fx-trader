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
        training_output_uri = f"s3://{training_output_bucket_name}/{currency}"        
        tuning_job_name = f"lstm-model-tuning-v1-{currency}"
# Baseline config        
#    "HyperParameters": {
#                 "units_layer1": "128", 
#                 "dropout_rate": "0.2",
#                 "units_dense1": "32", 
#                 "window_size": "10", 
#                 "batch_size": "32", 
#                 "activation": "sigmoid", 
#                 "epoch": "30", 
#             },
        tuning_job_config = {
            "HyperParameterTuningJobName": tuning_job_name,
            "HyperParameterTuningJobConfig": {
                "Strategy": "Bayesian",
                "HyperParameterTuningJobObjective": {
                    "Type": "Minimize",
                    "MetricName": "mse"
                },
                "ResourceLimits": {
                    "MaxNumberOfTrainingJobs": 50,
                    "MaxParallelTrainingJobs": 1
                },
                "ParameterRanges": {
                    "IntegerParameterRanges": [
                        {
                            "Name":"units_layer1",
                            "MinValue": "64",
                            "MaxValue": "256"
                        },
                        {
                            "Name":"units_dense1",
                            "MinValue": "16",
                            "MaxValue": "64"
                        }, 
                        {
                            "Name":"batch_size",
                            "MinValue": "16",
                            "MaxValue": "64"
                        },  
                        {
                            "Name":"window_size",
                            "MinValue": "10",
                            "MaxValue": "30"
                        },
                        {
                            "Name":"epoch",
                            "MinValue": "10",
                            "MaxValue": "50"
                        },  
                    ],
                    "ContinuousParameterRanges": [                        
                        {
                            "Name": "dropout_rate",
                            "MinValue": "0.1",
                            "MaxValue": "0.3"
                        }
                    ],                    
                }
            },
            "TrainingJobDefinition": {
                "StaticHyperParameters": {
                    "activation":"sigmoid",
                    "validation_split": "20",
                    "currency": currency,
                    "sagemaker_program": "lstm_train.py",
                    "sagemaker_submit_directory": training_script_uri,                                  
                },
                "AlgorithmSpecification": {
                    "TrainingInputMode": "File",
                    "TrainingImage": '763104351884.dkr.ecr.us-west-2.amazonaws.com/tensorflow-training:2.12.0-cpu-py310',
                    "MetricDefinitions": [
                        {"Name": "r2_score",
                            "Regex": "R2 Score: ([-+]?[0-9.]+).*$"},
                        {"Name": "mse",
                            "Regex": "Mean Squared Error: ([0-9.]+).*$"},
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
                    "InstanceType": "ml.m5.xlarge",
                    "InstanceCount": 1,
                    "VolumeSizeInGB": 10
                },
                "StoppingCondition": {
                    "MaxRuntimeInSeconds": 3600
                }
            }
        }
        
        # training_job_config = {           
            
        #     "DebugHookConfig": {
        #         "S3OutputPath": tensorboard_output_uri,
        #         "CollectionConfigurations": [
        #             {
        #                 "CollectionName": "tensorboard",
        #                 "CollectionParameters": {
        #                     "include_regex": ".*tensorboard.*"
        #                 },
        #             }
        #         ]
        #     },
        # }        
        client.create_hyper_parameter_tuning_job(**tuning_job_config)

    return 'Job started'
