import boto3
import os
import time

def handle(event, context):   
    sagemaker = boto3.client('sagemaker')
    sagemaker_role_arn = os.environ['SAGEMAKRR_ROLE_ARN']
    currency_config = ['CAD','AUD','EUR','GBP','NZD','CHF','JPY']
    for currency in currency_config:
        tuning_job_name = f'lstm-model-tuning-v1-{currency}'
        tuning_job_result = sagemaker.describe_hyper_parameter_tuning_job(HyperParameterTuningJobName=tuning_job_name)
        best_job = tuning_job_result['BestTrainingJob']['TrainingJobName']
        model_name = best_job + "-model"
        info = sagemaker.describe_training_job(TrainingJobName=best_job)
        model_data = info['ModelArtifacts']['S3ModelArtifacts']
        primary_container = {
            'Image': info['AlgorithmSpecification']['TrainingImage'],
            'ModelDataUrl': model_data
        }
        
        ## Create model based on best job
        sagemaker.create_model(ModelName=model_name, ExecutionRoleArn=sagemaker_role_arn, PrimaryContainer=primary_container)        
        
        
        ## Create endpoint config pointing to the model
        endpoint_config_name = 'endpoint-config-' + tuning_job_name
        sagemaker.create_endpoint_config(
            EndpointConfigName=endpoint_config_name,
            ProductionVariants=[
                {
                    "VariantName": "All",
                    "ModelName": model_name,
                    "ServerlessConfig": {
                        "MaxConcurrency": 1,
                        "MemorySizeInMB": 1024
                    }         
                }
            ]
        )
        
        ## Create endpoint with the config
        endpoint_name = 'endpoint-' + tuning_job_name
        sagemaker.create_endpoint(
            EndpointName=endpoint_name,
            EndpointConfigName=endpoint_config_name
        )
        
        while True:
            response = sagemaker.describe_endpoint(EndpointName=endpoint_name)
            status = response['EndpointStatus']

            if status == 'InService':
                break
            elif status == 'Failed':                
                raise Exception(f"Endpoint creation for {currency} failed!")
            else:
                time.sleep(30)  # Sleep for 30 seconds


    
    