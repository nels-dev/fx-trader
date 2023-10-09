import os
import pandas as pd
import pandas_ta as ta
import boto3
import logging
from io import StringIO
logger = logging.getLogger()
logger.setLevel(logging.INFO)
def handle(event, context):
     ## The S3 bucket
    bucket = os.environ['BUCKET_NAME']
    
    currency_config = ['CAD','AUD','EUR','GBP','NZD','CHF','JPY']
    s3 = boto3.resource('s3')
    for ccy in currency_config:
        file_name = 'USD_' + ccy + '_market_data.csv'
        obj = s3.Bucket(bucket).Object(file_name).get()
        df = pd.read_csv(obj['Body'], parse_dates=[0], index_col=0)
        
        ## workaround for executing pandas_ta in lambda environment
        df.ta.cores=0
        df.ta.strategy('momentum', append=True)
        df.ta.strategy('trend', append=True)
        df.ta.strategy('volatility', append=True)
        df.ta.strategy('candles', append=True)
        df['1d_delta'] = df['close'].pct_change(1)
        df['5d_delta'] = df['close'].pct_change(5)
        df = df.dropna(axis='columns', how='all').fillna(method='ffill').dropna()
        csv_buffer = StringIO()
        df.to_csv(csv_buffer)
        s3.Bucket(bucket).Object('USD_' + ccy + '_features.csv').put(Body=csv_buffer.getvalue())
        logger.info(ccy + " data uploaded")