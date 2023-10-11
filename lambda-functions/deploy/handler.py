import boto3
import os
import time
def handle(event, context):    
    currency_config = ['CAD','AUD','EUR','GBP','NZD','CHF','JPY']
    client = boto3.client('sagemaker')

    
    for currency in currency_config:
        training_jobs = client.list_training_jobs(
            NameContains=f'random-forest-train-{currency}',
            SortBy='CreationTime',
            SortOrder='Descending',
            StatusEquals='Completed'
        )
        
        if training_jobs['TrainingJobSummaries']:        
            training_job_name =  training_jobs['TrainingJobSummaries'][0]['TrainingJobName']
            create_model(training_job_name, currency)
        else:
            continue
        
def create_model(job_name, currency):
    client = boto3.client('sagemaker')
    sagemaker_role_arn = os.environ['SAGEMAKRR_ROLE_ARN']
    training_job_detail = client.describe_training_job(TrainingJobName=job_name)
    model_name = "model-" + job_name
    client.create_model(
        ModelName=model_name,
        PrimaryContainer={
            "Image": training_job_detail["AlgorithmSpecification"]["TrainingImage"],
            "Mode": "SingleModel",
            "ModelDataUrl": training_job_detail["ModelArtifacts"]["S3ModelArtifacts"],
            "Environment":{
                "SAGEMAKER_PROGRAM": training_job_detail["HyperParameters"]["sagemaker_program"],
                "SAGEMAKER_SUBMIT_DIRECTORY": training_job_detail["HyperParameters"]["sagemaker_submit_directory"],
            }
        },
        ExecutionRoleArn=sagemaker_role_arn
    )
    
    
    sagemaker_endpoint_name = f'USD-{currency}-predict'
    endpoint_config_name = 'endpoint-config-'+ str(int(time.time()))
    client.create_endpoint_config(
        EndpointConfigName = endpoint_config_name,
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
    
    try:
        client.describe_endpoint(EndpointName=sagemaker_endpoint_name)
        client.update_endpoint(
            EndpointName=sagemaker_endpoint_name,
            EndpointConfigName=endpoint_config_name
        )
        
    except client.exceptions.ClientError as e:
        client.create_endpoint(
            EndpointName=sagemaker_endpoint_name,
            EndpointConfigName=endpoint_config_name
        )
    
    
    
