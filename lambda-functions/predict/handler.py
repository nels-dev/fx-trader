import boto3
import pandas as pd
import os
import json
import pymongo

sagemaker = boto3.client('sagemaker')
runtime = boto3.client('sagemaker-runtime')
s3 = boto3.resource('s3')

def save_to_documentdb(result):
    # Get connection parameters from environment variables
    host = os.environ['MONGO_HOST']
    username = os.environ['MONGO_USERNAME']
    password = os.environ['MONGO_PASSWORD']
    db_name = os.environ['MONGO_DB_NAME']

    # Connect to DocumentDB
    client = pymongo.MongoClient(f"mongodb+srv://{username}:{password}@{host}/?retryWrites=true&w=majority")
    db = client[db_name]
    collection = db['predictions']

    # Save the result
    collection.insert_one(result)

def get_training_job_name_from_model(model_name):    
    model_response = sagemaker.describe_model(ModelName=model_name)
    data_url = model_response['PrimaryContainer']['ModelDataUrl']
    training_job_name = data_url.split('/')[-3]
    return training_job_name

def get_window_size_from_training_job(training_job_name):    
    training_response = sagemaker.describe_training_job(TrainingJobName=training_job_name)    
    window_size = training_response['HyperParameters'].get('window_size')
    batch_size = training_response['HyperParameters'].get('batch_size')
    return (int(window_size), int(batch_size))

def get_window_size_from_endpoint(endpoint_name):
    endpoint_response = sagemaker.describe_endpoint(EndpointName=endpoint_name)
    endpoint_config_name = endpoint_response['EndpointConfigName']
    config_response = sagemaker.describe_endpoint_config(EndpointConfigName=endpoint_config_name)
    model_name = config_response['ProductionVariants'][0]['ModelName']
    training_job_name = get_training_job_name_from_model(model_name)
    window_size = get_window_size_from_training_job(training_job_name)
    return window_size

def standardize(column):
    if column.std() == 0:
        return column
    return (column - column.mean()) / column.std()

def handle(event, context):
    
    bucket = os.environ['BUCKET_NAME']
    currency_config = ['CAD','AUD','EUR','GBP','NZD','CHF','JPY']
    
    for currency in currency_config:
        file_name = f'USD_{currency}_features.csv'
        obj = s3.Bucket(bucket).Object(file_name).get()
        endpoint_name = f'endpoint-model-lstm-v2-{currency}'
        window_size, batch_size = get_window_size_from_endpoint(endpoint_name)
        df = pd.read_csv(obj['Body'], parse_dates=[0], index_col=0)
        predict_data = df.apply(standardize).values
        X = predict_data[-window_size:, :]
        payload = json.dumps(X.reshape(1, window_size, -1).tolist())
        response = runtime.invoke_endpoint(EndpointName = endpoint_name, Body=payload, ContentType='application/json', Accept='application/json')
        result= json.loads(response['Body'].read().decode())
        prediction_value = result['predictions'][0][0]
        save_to_documentdb({"currency": currency, "prediction":prediction_value, "date": df.index[-1]})
        