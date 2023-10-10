import boto3
import os
import time
def handle(event, context):    
    client = boto3.client('sagemaker')
    sagemaker_role_arn = os.environ['SAGEMAKRR_ROLE_ARN']
    sagemaker_endpoint_name = 'ForexPredictionEndpoint'
    training_job_name = event['training_job_name']
    training_job_detail = client.describe_training_job(TrainingJobName=training_job_name)
    if training_job_detail['TrainingJobStatus'] == 'InProgress':
        raise Exception('Job is in progress') 
    print(training_job_detail)
    
    
    model_name = "model-" + training_job_name
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
    
    
    
