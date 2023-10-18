import json
import logging
import os
from io import StringIO
import boto3
import yfinance as yf
import nasdaqdatalink


logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handle(event, context):
    currency_config = [
        ('CAD', 'RATEINF/INFLATION_CAN'),
        ('AUD', 'RATEINF/INFLATION_AUS'),
        ('EUR', 'RATEINF/INFLATION_EUR'),  
        ('GBP', 'RATEINF/INFLATION_GBR'),        
        ('NZD', 'RATEINF/INFLATION_NZL'),        
        ('CHF', 'RATEINF/INFLATION_CHE'),        
        ('JPY', 'RATEINF/INFLATION_JPN'),        
    ]

    ## The S3 bucket
    bucket = os.environ['BUCKET_NAME']
    ## API KEY
    api_key = os.environ['NASDAQ_API_KEY']
    nasdaqdatalink.ApiConfig.api_key = api_key


    for (ccy, inf_dataset) in currency_config:
        df = fetchDataForCurrency(ccy,inf_dataset)
        csv_buffer = StringIO()
        df.to_csv(csv_buffer)
        uploadToS3(bucket, csv_buffer, ccy)
        logger.info(ccy + " data uploaded")
        
    return 'Completed'

def uploadToS3(bucket, buffer, ccy):
    s3_resource = boto3.resource('s3')
    s3_resource.Object(bucket, 'USD_' + ccy + '_market_data.csv').put(Body=buffer.getvalue())

def fetchDataForCurrency(ccy, inf_dataset):
    
    # Download macroeconomic data from NASDAQ
    fed_rates = nasdaqdatalink.get("FED/RIFSPFF_N_D")
    fed_rates = fed_rates['2004-01-01':]
    #fccy_inflation_rate = nasdaqdatalink.get(inf_dataset)
    #fccy_inflation_rate = fccy_inflation_rate['2003-11-30':]
    #usa_inflation_rate = nasdaqdatalink.get("RATEINF/INFLATION_USA")
    #usa_inflation_rate = usa_inflation_rate['2003-11-30':]

    ticker = yf.Ticker(ccy+ '=X')
    hist = ticker.history(period='max')
    hist = hist['2004-01-01':]
    hist.rename(columns={'Close':'close', 'Open':'open', 'High':'high', 'Low':'low'}, inplace=True)
    
    # Drop empty columns
    hist.drop(columns=['Dividends', 'Stock Splits', 'Volume'], inplace=True)

    hist.index = hist.index.date

    combined = hist.merge(fed_rates, how='outer', left_index=True, right_index=True, suffixes=(None, "_fed"))

    combined.rename(columns={'Value':'fed_rate'}, inplace=True)
    # forward-fill fields with no data
    combined['fed_rate'].fillna(method='ffill', inplace=True)    

    df=combined.copy().dropna()
    return df